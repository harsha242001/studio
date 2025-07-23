'use server';
/**
 * @fileOverview This file defines the tools that the AI can use to find
 * recharge plans. These tools abstract the data-fetching and business logic,
 * allowing the AI to focus on its core task of analysis and recommendation.
 */

import {ai} from '@/ai/genkit';
import type {Plan} from '@/ai/schemas';
import {PlanSchema} from '@/ai/schemas';
import {MOCK_PLANS} from '@/services/telecom-service';
import {z} from 'zod';

// #################################################################################
// Tool: Find Exact Match Plan
// #################################################################################

// Input schema for the tool that finds an exact match.
const FindExactMatchPlanInputSchema = z.object({
  dailyDataUsageGB: z.number(),
  validityDays: z.number(),
  telecomProvider: z.string(),
});

/**
 * A tool that finds a single recharge plan that exactly matches the user's
 * specified data and validity preferences for a given provider.
 */
export const findExactMatchPlanTool = ai.defineTool(
  {
    name: 'findExactMatchPlanTool',
    description: `Finds the single, best recharge plan that exactly matches the user's daily data and validity requirements.`,
    inputSchema: FindExactMatchPlanInputSchema,
    outputSchema: z.nullable(PlanSchema),
  },
  async (input) => {
    console.log('Finding exact match plan with input:', input);
    const providerPlans = MOCK_PLANS.filter(
      (p) => p.provider.toLowerCase() === input.telecomProvider.toLowerCase()
    );

    const exactMatches = providerPlans.filter(
      (p) =>
        p.dailyData === input.dailyDataUsageGB &&
        p.validity === input.validityDays
    );

    // If multiple exact matches exist, return the cheapest one.
    if (exactMatches.length > 0) {
      return exactMatches.sort((a, b) => a.price - b.price)[0];
    }

    return null;
  }
);

// #################################################################################
// Tool: Find Similar Plans
// #################################################################################

/**
 * A tool that finds plans with the same daily data but different validity
 * periods, which can be useful alternatives for the user.
 */
export const findSimilarPlansTool = ai.defineTool(
  {
    name: 'findSimilarPlansTool',
    description: `Finds up to 5 plans that have the same daily data but different validity periods.`,
    inputSchema: FindExactMatchPlanInputSchema,
    outputSchema: z.array(PlanSchema),
  },
  async (input) => {
    console.log('Finding similar plans with input:', input);
    const providerPlans = MOCK_PLANS.filter(
      (p) => p.provider.toLowerCase() === input.telecomProvider.toLowerCase()
    );

    const similar = providerPlans
      .filter(
        (p) =>
          p.dailyData === input.dailyDataUsageGB &&
          p.validity !== input.validityDays
      )
      .map((plan) => ({
        ...plan,
        // Score by how close the validity is to the user's preference.
        score: Math.abs(plan.validity - input.validityDays),
      }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);

    return similar;
  }
);

// #################################################################################
// Tool: Find Value for Money Plans
// #################################################################################

// Input schema for the value-for-money tool. It requires a baseline plan
// to compare against.
const FindValueForMoneyInputSchema = z.object({
  baselinePlan: PlanSchema,
  telecomProvider: z.string(),
});

/**
 * This is the most complex tool. It takes a baseline plan and finds other plans
 * from the same provider that offer a better long-term value proposition.
 * It calculates the potential savings and provides a clear reason for the
 * recommendation.
 */
export const findValueForMoneyPlansTool = ai.defineTool(
  {
    name: 'findValueForMoneyPlansTool',
    description:
      'Finds up to 2 plans that offer better long-term value than a given baseline plan.',
    inputSchema: FindValueForMoneyInputSchema,
    outputSchema: z.array(
      PlanSchema.extend({
        reasoning: z.string(),
      })
    ),
  },
  async ({baselinePlan, telecomProvider}) => {
    console.log(
      'Finding value for money plans based on baseline:',
      baselinePlan
    );
    const providerPlans = MOCK_PLANS.filter(
      (p) => p.provider.toLowerCase() === telecomProvider.toLowerCase()
    );

    // Filter for plans with the same data but longer validity.
    const potentialValuePlans = providerPlans.filter(
      (p) =>
        p.dailyData === baselinePlan.dailyData &&
        p.validity > baselinePlan.validity
    );

    const valuePlans = potentialValuePlans
      .map((plan) => {
        // Determine how many times the user would need to buy the baseline plan
        // to cover the duration of the potential value plan. Always round up.
        const rechargeMultiplier = Math.ceil(plan.validity / baselinePlan.validity);
        const extrapolatedCost = rechargeMultiplier * baselinePlan.price;
        const savings = extrapolatedCost - plan.price;

        if (savings > 0) {
          return {
            ...plan,
            reasoning: `Choosing this ${plan.validity}-day plan for ₹${plan.price} is cheaper than buying the ${baselinePlan.validity}-day plan ${rechargeMultiplier} times (which would cost ₹${extrapolatedCost}). You save ₹${savings}.`,
            savings, // Add savings property for sorting
          };
        }
        return null;
      })
      .filter((p): p is Plan & {reasoning: string; savings: number} => p !== null) // Type guard
      .sort((a, b) => b.savings - a.savings) // Sort by the most savings
      .slice(0, 2); // Return the top 2

    return valuePlans;
  }
);
