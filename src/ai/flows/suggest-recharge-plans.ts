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

// Define the comprehensive analysis prompt.
const analysisPrompt = ai.definePrompt({
  name: 'rechargeAnalysisPrompt',
  input: {schema: AnalysisPromptInputSchema},
  output: {schema: SuggestRechargePlansOutputSchema},
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

      Please perform the following analysis and provide the output in the required JSON format:

      1.  **Exact Match Plans**: Find up to two plans that exactly match the user's daily data and validity preferences.

      2.  **Similar Plans**: Find up to five plans that offer the *same daily data* but have a *different validity period*. Sort these by how close their validity is to the user's preference (ascending order of difference).

      3.  **Value for Money Plans**: Your most important task.
          - First, identify the primary "exact match" plan to use as a baseline for comparison. If multiple exact matches exist, use the one with the lowest price. **If no exact match is found, you MUST return an empty array for valueForMoneyPlans.**
          - Compare the baseline plan to all other available plans that have the **same daily data** but a **longer validity**.
          - A plan is "value for money" if it offers long-term savings.
          - To calculate the savings, you must determine how many times the user would need to buy the baseline plan to cover the duration of the longer plan. **You MUST always round this number UP to the nearest whole number (ceiling).**
          - Your reasoning MUST include the specific calculation. For example: "Choosing this 84-day plan for ₹859 is cheaper than buying the 28-day plan 3 times (which would cost ₹1047). You save ₹188."
          - Identify up to two such plans that offer the best savings and list them. Ensure you consider all plans with longer validity, including those with irregular validities (e.g., 77 days, 90 days).
    `,
  model: 'googleai/gemini-2.0-flash',
  output: {format: 'json'},
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

    // 2. Call the single AI prompt with the user's input and the filtered list of plans.
    const {output} = await analysisPrompt({
      ...input,
      allPlans: providerPlans,
    });

    // 3. Return the structured output from the AI.
    // If the AI returns no output, return empty arrays to avoid errors.
    if (!output) {
      return {
        exactMatchPlans: [],
        similarPlans: [],
        valueForMoneyPlans: [],
      };
    }
    
    return output;
  }
);
