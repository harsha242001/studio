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
  PlanSchema
} from '@/ai/schemas';
import {getLiveRechargePlans} from '@/services/telecom-service';
import { z } from 'zod';

// Define the schema for the tool's output, which is just an array of all available plans
const AllPlansSchema = z.object({
  plans: z.array(PlanSchema),
});

// Define the tool for fetching live recharge plans
const getLiveRechargePlansTool = ai.defineTool(
  {
    name: 'getLiveRechargePlans',
    description: 'Get a list of currently available recharge plans from telecom providers based on user preferences.',
    inputSchema: SuggestRechargePlansInputSchema,
    outputSchema: AllPlansSchema,
  },
  async (input) => {
    // This calls our service to get scored and sorted plans.
    const plans = await getLiveRechargePlans(input);
    return { plans };
  }
);


// Define the main function that will be called
export async function suggestRechargePlans(input: SuggestRechargePlansInput): Promise<SuggestRechargePlansOutput> {
  return suggestRechargePlansFlow(input);
}

// Define the prompt
const prompt = ai.definePrompt({
  name: 'suggestRechargePlansPrompt',
  input: {schema: SuggestRechargePlansInputSchema},
  output: {schema: SuggestRechargePlansOutputSchema},
  tools: [getLiveRechargePlansTool],
  prompt: `You are a recharge plan recommendation expert. Your goal is to help users find the best mobile recharge plan and uncover significant long-term savings.

  User Preferences:
  - Daily Data Usage: {{dailyDataUsageGB}} GB/day
  - Validity: {{validityDays}} days
  - Telecom Provider: {{telecomProvider}}
  {{#if location}}
  - Location: {{location}}
  {{/if}}

  Follow these steps carefully:

  Step 1: Fetch Available Plans
  You MUST use the 'getLiveRechargePlans' tool to fetch a list of relevant plans based on the user's preferences. The tool will return a list of all available plans that are sorted by relevance.

  Step 2: Identify Direct Matches from Tool Output
  From the tool's output, select up to 3 plans that are the closest direct match to the user's request for data and validity. Populate the 'suggestedPlans' list with these. These should be the top results from the tool's response.

  Step 3: Perform Value-for-Money Analysis (AI INTELLIGENCE)
  This is the most important step. Analyze ALL plans returned by the tool to find "hidden gems" that offer better long-term value.
  - Look for annual (365 days) or other long-validity plans.
  - Take a direct match plan (e.g., a 28-day plan) and calculate its total cost over a year. For example, if a 28-day plan costs ₹299, the annual cost would be approximately (365 / 28) * 299.
  - Compare this calculated annual cost to the price of an actual annual plan from the tool output.
  - If the annual plan is cheaper AND offers similar or better benefits (like more daily data), it is a superior value-for-money option.

  Step 4: Populate Value-for-Money Suggestions
  - If you find one or two plans that offer significant long-term savings, add them to the 'valueForMoneyPlans' list.
  - For each plan in this list, you MUST write a clear 'reasoning' statement. Explain the long-term benefit and the potential savings. For example: "This annual plan costs ₹3599, saving you over ₹280 compared to recharging the ₹299 monthly plan for a year, and you get more data!".
  - Do NOT add plans to this list unless they offer a clear, financial advantage over time.

  You must populate the final output based on your analysis of the data provided by the 'getLiveRechargePlans' tool.
  `,
});

// Define the flow
const suggestRechargePlansFlow = ai.defineFlow(
  {
    name: 'suggestRechargePlansFlow',
    inputSchema: SuggestRechargePlansInputSchema,
    outputSchema: SuggestRechargePlansOutputSchema,
  },
  async (input) => {
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        const {output} = await prompt(input);
        if (output && (output.suggestedPlans.length > 0 || output.valueForMoneyPlans.length > 0)) {
          return output;
        }
        // If the output is empty, it might be a model error, so we can retry.
        console.log(`AI returned empty result, retrying... (${i + 1}/${maxRetries})`);
      } catch (error: any) {
        // Check if the error is a 503 Service Unavailable and if we have retries left
        if (error.message.includes('503') && i < maxRetries - 1) {
          console.log(`Service unavailable, retrying... (${i + 1}/${maxRetries})`);
          // Wait for a second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // If it's not a 503 or we've run out of retries, throw the error
          throw error;
        }
      }
    }
    // If after all retries we still have no plans, return an empty object to avoid crashes.
    return { suggestedPlans: [], valueForMoneyPlans: [] };
  }
);
