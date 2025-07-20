'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting recharge plans based on user preferences.
 *
 * The flow takes user inputs such as daily data usage and validity preferences, and returns a list of suggested recharge plans.
 * It includes:
 * - suggestRechargePlans: The main function to trigger the flow.
 */

import {ai} from '@/ai/genkit';
import {
  SuggestRechargePlansInput,
  SuggestRechargePlansInputSchema,
  SuggestRechargePlansOutput,
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

const suggestionPrompt = ai.definePrompt({
  name: 'suggestionPrompt',
  input: {schema: SuggestRechargePlansInputSchema},
  output: {schema: SuggestRechargePlansOutputSchema},
  tools: [findExactMatchPlanTool, findValueForMoneyPlansTool],
  prompt: `You are a helpful assistant for finding mobile recharge plans.

  User Preferences:
  - Daily Data Usage: {{dailyDataUsageGB}} GB/day
  - Validity: {{validityDays}} days
  - Telecom Provider: {{telecomProvider}}
  {{#if location}}- Location: {{location}}{{/if}}

  Follow these steps:
  1.  First, use the 'findExactMatchPlanTool' to find a plan that exactly matches the user's daily data and validity preference.
  2.  If an exact match is found, use it as the baseline for the next step.
  3.  Next, use the 'findValueForMoneyPlansTool'. Provide it with all the user's preferences AND the baseline plan you just found. This tool will find long-term plans that are cheaper per day.
  4.  Return all the plans you've found in the correct output format. You don't need to find similar plans; the tools handle that.
  `,
});

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

    const {output} = await suggestionPrompt(numericInput);

    if (!output) {
      throw new Error('The AI failed to generate a response.');
    }

    return output;
  }
);
