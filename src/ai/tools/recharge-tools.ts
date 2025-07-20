'use server';

/**
 * @fileoverview Defines tools for finding and analyzing mobile recharge plans.
 * - findExactMatchPlanTool: Finds plans that perfectly match user criteria.
 * - findValueForMoneyPlansTool: Finds plans that offer better long-term value.
 * - findSimilarPlansTool: Finds plans with similar data but different validity.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {PlanSchema, SuggestRechargePlansInputSchema} from '@/ai/schemas';
import {MOCK_PLANS} from '@/services/telecom-service';

export const findExactMatchPlanTool = ai.defineTool(
  {
    name: 'findExactMatchPlanTool',
    description:
      "Finds a recharge plan that exactly matches the user's specified daily data and validity period for a given provider.",
    inputSchema: SuggestRechargePlansInputSchema,
    outputSchema: z.object({
      exactMatchPlan: PlanSchema.optional(),
    }),
  },
  async (input) => {
    console.log('Finding exact match for:', input);
    const {dailyDataUsageGB, validityDays, telecomProvider} = input;

    const providerPlans = MOCK_PLANS.filter(
      (p) => p.provider.toLowerCase() === telecomProvider.toLowerCase()
    );

    const exactMatchPlan = providerPlans.find(
      (p) =>
        p.dailyData === dailyDataUsageGB && p.validity === validityDays
    );

    return {exactMatchPlan};
  }
);

const ValueAnalysisInputSchema = SuggestRechargePlansInputSchema.extend({
  baselinePlan: PlanSchema,
});

const ValueForMoneyPlanSchema = PlanSchema.extend({
  reasoning: z
    .string()
    .describe(
      'A brief explanation of why this plan offers better long-term value compared to the baseline plan, including specific cost-per-day calculations or total savings.'
    ),
});

export const findValueForMoneyPlansTool = ai.defineTool(
  {
    name: 'findValueForMoneyPlansTool',
    description:
      'Given a baseline plan, finds other plans from the same provider that offer better long-term value, such as annual plans with a lower cost per day. Calculates savings.',
    inputSchema: ValueAnalysisInputSchema,
    outputSchema: z.object({
      valueForMoneyPlans: z.array(ValueForMoneyPlanSchema),
    }),
  },
  async (input) => {
    console.log('Finding value-for-money plans based on:', input);
    const {baselinePlan, telecomProvider, dailyDataUsageGB} = input;

    const providerPlans = MOCK_PLANS.filter(
      (p) => p.provider.toLowerCase() === telecomProvider.toLowerCase()
    );

    const baselineCostPerDay = baselinePlan.price / baselinePlan.validity;

    const valueForMoneyPlans = providerPlans
      .filter((p) => {
        // Must provide at least the same amount of daily data
        if (p.dailyData < dailyDataUsageGB) return false;
        // Must be a different plan
        if (p.planName === baselinePlan.planName) return false;
        // Must have a lower cost per day
        const currentPlanCostPerDay = p.price / p.validity;
        return currentPlanCostPerDay < baselineCostPerDay;
      })
      .map((p) => {
        const costPerDay = p.price / p.validity;
        const savingsPerDay = baselineCostPerDay - costPerDay;
        const yearlySavings = savingsPerDay * 365;
        return {
          ...p,
          reasoning: `This plan is cheaper per day (₹${costPerDay.toFixed(
            2
          )} vs ₹${baselineCostPerDay.toFixed(
            2
          )}). You could save approximately ₹${yearlySavings.toFixed(
            0
          )} over a year.`,
        };
      })
      .sort((a, b) => a.price / a.validity - b.price / b.validity); // Sort by best value (lowest cost per day)

    return {
      valueForMoneyPlans: valueForMoneyPlans.slice(0, 2), // Return top 2 value plans
    };
  }
);

export const findSimilarPlansTool = ai.defineTool(
  {
    name: 'findSimilarPlansTool',
    description:
      "Finds recharge plans that have the same daily data but different validity periods, sorted by the closest validity.",
    inputSchema: SuggestRechargePlansInputSchema,
    outputSchema: z.object({
      similarPlans: z.array(PlanSchema),
    }),
  },
  async (input) => {
    console.log('Finding similar plans for:', input);
    const {dailyDataUsageGB, validityDays, telecomProvider} = input;

    const providerPlans = MOCK_PLANS.filter(
      (p) => p.provider.toLowerCase() === telecomProvider.toLowerCase()
    );

    const similarPlans = providerPlans
      .filter(
        (plan) =>
          plan.dailyData === dailyDataUsageGB && plan.validity !== validityDays
      )
      .map((plan) => ({
        ...plan,
        score: Math.abs(plan.validity - validityDays),
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 5); // Return top 5 similar plans

    return {similarPlans};
  }
);
