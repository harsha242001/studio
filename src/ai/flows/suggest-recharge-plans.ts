'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting recharge plans.
 * It uses a single, powerful AI-driven prompt to analyze a list of available plans
 * and categorize them into exact matches, similar plans, and value-for-money
 * options based on user input.
 */

import {ai} from '@/ai/genkit';
import type {
  SuggestRechargePlansInput,
  SuggestRechargePlansOutput,
} from '@/ai/schemas';
import {
  SuggestRechargePlansInputSchema,
  SuggestRechargePlansOutputSchema,
  PlanSchema,
} from '@/ai/schemas';
import {MOCK_PLANS} from '@/services/telecom-service';
import {z} from 'zod';

// The main function that the UI calls.
export async function suggestRechargePlans(
  input: SuggestRechargePlansInput
): Promise<SuggestRechargePlansOutput> {
  return suggestRechargePlansFlow(input);
}

// Define an input schema for the analysis prompt, which includes the user's
// preferences and the list of all available plans for their provider.
const AnalysisPromptInputSchema = SuggestRechargePlansInputSchema.extend({
  allPlans: z.array(PlanSchema),
});

// Define a safe output schema for the prompt that avoids requiring full plan objects
// for value-for-money suggestions. We'll map these to full plans locally.
const ValueForMoneySuggestionSchema = z.object({
  planName: z.string(),
  reasoning: z.string(),
});

const AnalysisPromptOutputSchema = z.object({
  exactMatchPlans: z.array(PlanSchema),
  similarPlans: z.array(PlanSchema),
  valueForMoneySuggestions: z.array(ValueForMoneySuggestionSchema),
});

// Define the comprehensive analysis prompt.
const analysisPrompt = ai.definePrompt({
  name: 'rechargeAnalysisPrompt',
  input: {schema: AnalysisPromptInputSchema},
  output: {schema: AnalysisPromptOutputSchema},
  prompt: `
      You are an expert telecom plan analyst. Your task is to analyze a list of available recharge plans and suggest the best options to a user based on their preferences.

      User Preferences:
      - Daily Data: {{{dailyDataUsageGB}}} GB
      - Validity: {{{validityDays}}} days
      - Provider: {{{telecomProvider}}}
      {{#if location}}- Location: {{{location}}}{{/if}}

      Here is the full list of available plans for the user's provider:
      {{#each allPlans}}
      - {{json this}}
      {{/each}}

      Perform the following analysis and return strict JSON matching the schema described below:

      1.  Exact Match Plans: Up to two plans that exactly match the user's daily data and validity preferences.

      2.  Similar Plans: Up to five plans that offer the same daily data but a different validity period. Sort by closeness of validity (ascending absolute difference).

      3.  Value for Money Suggestions: Your most important task.
          - Identify the primary exact match baseline (lowest price if multiple). If none exists, return an empty array for valueForMoneySuggestions.
          - Compare against plans with the same daily data but longer validity.
          - Compute savings by comparing baseline repeated purchases (round UP) vs longer plan one-time cost.
          - Include the calculation in the reasoning string.
          - Output only objects of the form { planName, reasoning } for the most valuable 1-2 options.

      Output Schema:
      {
        "exactMatchPlans": Plan[],
        "similarPlans": Plan[],
        "valueForMoneySuggestions": { planName: string, reasoning: string }[]
      }
    `,
  model: 'googleai/gemini-2.0-flash',
});

// Define the main flow that orchestrates the process.
const suggestRechargePlansFlow = ai.defineFlow(
  {
    name: 'suggestRechargePlansFlow',
    inputSchema: SuggestRechargePlansInputSchema,
    outputSchema: SuggestRechargePlansOutputSchema,
  },
  async (input) => {
    // 1. Filter all mock plans to get only those from the selected provider.
    const providerPlans = MOCK_PLANS.filter(
      (p) => p.provider.toLowerCase() === input.telecomProvider.toLowerCase()
    );

    // 2. Try the AI prompt; if it fails (e.g., 503 model overload), fall back to local computation.
    let output: z.infer<typeof AnalysisPromptOutputSchema> | null = null;
    try {
      const res = await analysisPrompt({
        ...input,
        allPlans: providerPlans,
      });
      output = res.output ?? null;
    } catch (err) {
      console.warn('AI analysis prompt failed; falling back to local computation.', err);
      output = null;
    }

    // 3. Use AI output when available; otherwise compute locally.
    const exactMatchPlans = output?.exactMatchPlans && output.exactMatchPlans.length > 0
      ? output.exactMatchPlans
      : providerPlans
          .filter(
            (p) => p.dailyData === input.dailyDataUsageGB && p.validity === input.validityDays
          )
          .sort((a, b) => a.price - b.price)
          .slice(0, 2);

    const similarPlans = output?.similarPlans && output.similarPlans.length > 0
      ? output.similarPlans
      : providerPlans
          .filter(
            (p) => p.dailyData === input.dailyDataUsageGB && p.validity !== input.validityDays
          )
          .map((p) => ({plan: p, score: Math.abs(p.validity - input.validityDays)}))
          .sort((a, b) => a.score - b.score)
          .slice(0, 5)
          .map((x) => x.plan);

    // Compute value-for-money plans LOCALLY to ensure robust, deterministic savings logic.
    // Baseline: cheapest exact match (same daily data AND validity as user input).
    const baseline = providerPlans
      .filter(
        (p) =>
          p.dailyData === input.dailyDataUsageGB &&
          p.validity === input.validityDays
      )
      .sort((a, b) => a.price - b.price)[0];

    let valueForMoneyPlans: Array<z.infer<typeof PlanSchema> & {reasoning: string}> = [];

    if (baseline) {
      // Candidates: longer validity plans that offer AT LEAST the requested daily data.
      // Heuristic: avoid suggesting very long-term plans when the user asked short-term.
      // Allow up to 4x the requested validity (e.g., for 28 days → up to 112 days).
      const maxAllowedValidity = input.validityDays * 4;
      const candidates = providerPlans.filter(
        (p) =>
          p.validity > baseline.validity &&
          p.dailyData >= input.dailyDataUsageGB &&
          p.validity <= maxAllowedValidity
      );

      valueForMoneyPlans = candidates
        .map((plan) => {
          const repeats = Math.ceil(plan.validity / baseline.validity);
          const baselineCostForSamePeriod = repeats * baseline.price;
          const savings = baselineCostForSamePeriod - plan.price;

          // Day-wise comparison for clarity
          const baselinePerDay = baseline.price / baseline.validity; // ₹/day
          const planPerDay = plan.price / plan.validity; // ₹/day
          const savingsPerDay = baselinePerDay - planPerDay; // ₹/day
          const totalSavingsByPerDay = savingsPerDay * plan.validity; // align with plan period

          const formatMoney = (n: number) => Math.round(n);
          const formatPerDay = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

          const extraDataNote = plan.dailyData > input.dailyDataUsageGB
            ? ` Plus, more data: ${plan.dailyData}GB/day.`
            : '';

          const reasoning = `${baseline.validity}-day plan: ₹${formatPerDay(baselinePerDay)}/day vs this ${plan.validity}-day plan: ₹${formatPerDay(planPerDay)}/day. You save ₹${formatPerDay(savingsPerDay)}/day → ₹${formatMoney(totalSavingsByPerDay)} over ${plan.validity} days.${extraDataNote}`;

          return {
            plan,
            savings: totalSavingsByPerDay, // rank by per-day derived total savings
            reasoning,
          };
        })
        .filter((x) => x.savings > 0)
        .sort((a, b) => b.savings - a.savings)
        .slice(0, 2)
        .map((x) => ({...x.plan, reasoning: x.reasoning}));
    }

    return {
      exactMatchPlans,
      similarPlans,
      valueForMoneyPlans,
    };
  }
);
