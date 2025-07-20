'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting recharge plans based on user preferences.
 *
 * The flow takes user inputs such as daily data usage and validity preferences, and returns a list of suggested recharge plans.
 * It includes:
 * - suggestRechargePlans: The main function to trigger the flow.
 */

import {ai} from '@/ai/genkit';
import type {
  SuggestRechargePlansInput,
  SuggestRechargePlansOutput,
  Plan,
} from '@/ai/schemas';
import {
  SuggestRechargePlansInputSchema,
  SuggestRechargePlansOutputSchema,
} from '@/ai/schemas';
import {
  findExactMatchPlanTool,
  findValueForMoneyPlansTool,
} from '@/ai/tools/recharge-tools';

// The main function that the UI calls.
export async function suggestRechargePlans(
  input: SuggestRechargePlansInput
): Promise<SuggestRechargePlansOutput> {
  return suggestRechargePlansFlow(input);
}

// Define the main flow.
const suggestRechargePlansFlow = ai.defineFlow(
  {
    name: 'suggestRechargePlansFlow',
    inputSchema: SuggestRechargePlansInputSchema,
    outputSchema: SuggestRechargePlansOutputSchema,
  },
  async (input) => {
    const numericInput = {
      ...input,
      dailyDataUsageGB: Number(input.dailyDataUsageGB),
      validityDays: Number(input.validityDays),
    };

    // Step 1: Find the exact match plan.
    const exactMatchResult = await findExactMatchPlanTool(numericInput);
    const exactMatchPlan = exactMatchResult.exactMatchPlan;

    let valueForMoneyPlans: (Plan & { reasoning: string })[] = [];

    // Step 2: If an exact match is found, find value-for-money plans.
    if (exactMatchPlan) {
      const valueAnalysisResult = await findValueForMoneyPlansTool({
        ...numericInput,
        baselinePlan: exactMatchPlan,
      });
      valueForMoneyPlans = valueAnalysisResult.valueForMoneyPlans;
    }

    // Step 3: Construct the final output.
    const output: SuggestRechargePlansOutput = {
      exactMatchPlans: exactMatchPlan ? [exactMatchPlan] : [],
      valueForMoneyPlans: valueForMoneyPlans,
      similarPlans: [], // This field is not being populated by the tools anymore.
    };

    return output;
  }
);
