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
  PlanSchema,
  Plan,
} from '@/ai/schemas';
import {getLiveRechargePlans} from '@/services/telecom-service';
import {z} from 'zod';

// Define the schema for the AI's analysis. It receives the user's preferences
// and the full list of available plans.
const ValueAnalysisInputSchema = SuggestRechargePlansInputSchema.extend({
  allPlans: z.array(PlanSchema),
});

// The AI's output is now ONLY the value-for-money plans.
const ValueAnalysisOutputSchema = z.object({
  valueForMoneyPlans: z.array(
    PlanSchema.extend({
      reasoning: z
        .string()
        .describe(
          'A brief explanation of why this plan offers better long-term value, including the potential savings compared to recharging a shorter-term plan over the same period.'
        ),
    })
  ),
});

// The main function that the UI calls. It now orchestrates the process.
export async function suggestRechargePlans(
  input: SuggestRechargePlansInput
): Promise<SuggestRechargePlansOutput> {
  return suggestRechargePlansFlow(input);
}

// Define the prompt for the AI's value analysis task.
// Its only job is to find long-term deals.
const valueAnalysisPrompt = ai.definePrompt({
  name: 'valueAnalysisPrompt',
  input: {schema: ValueAnalysisInputSchema},
  output: {schema: ValueAnalysisOutputSchema},
  prompt: `You are a recharge plan recommendation expert. Your ONLY goal is to find "hidden gems" in a list of plans that offer better long-term value.

  User Preferences:
  - Daily Data Usage: {{dailyDataUsageGB}} GB/day
  - Validity: {{validityDays}} days
  - Telecom Provider: {{telecomProvider}}

  Full list of available plans:
  {{#each allPlans}}
  - {{this.planName}}: ₹{{this.price}} for {{this.validity}} days with {{this.dailyData}} GB/day.
  {{/each}}

  Follow these steps carefully:

  Step 1: Perform Value-for-Money Analysis
  This is your only task. Analyze ALL plans in the provided list to find plans that offer better long-term value.
  - Look for annual (365 days) or other long-validity plans.
  - Compare their cost-effectiveness against shorter-term plans. For example, calculate the annual cost of a 28-day plan and see if an actual annual plan is cheaper.
  - If an annual plan is cheaper AND offers similar or better benefits (like more daily data), it is a superior value-for-money option.

  Step 2: Populate Value-for-Money Suggestions
  - If you find one or two plans that offer significant long-term savings, add them to the 'valueForMoneyPlans' list.
  - For each plan in this list, you MUST write a clear 'reasoning' statement. Explain the long-term benefit and the potential savings. For example: "This annual plan costs ₹3599, saving you over ₹280 compared to recharging the ₹299 monthly plan for a year, and you get more data!".
  - Do NOT add plans to this list unless they offer a clear, financial advantage over time.
  - If no plans offer significant long-term value, return an empty list.
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
    // Step 1: Get all relevant plans using our reliable TypeScript function.
    // This gives us a sorted list of the best direct matches.
    const allSortedPlans = await getLiveRechargePlans(input);

    // Step 2: Take the top 3 plans as the direct suggestions.
    // This is now done in code, not by the AI, so it's guaranteed to work.
    const suggestedPlans: Plan[] = allSortedPlans.slice(0, 3);

    // Step 3: Ask the AI to perform only the value analysis.
    // We pass the user's input and the full list of plans to the AI.
    let valueForMoneyPlans: SuggestRechargePlansOutput['valueForMoneyPlans'] = [];
    try {
      const {output} = await valueAnalysisPrompt({
        ...input,
        allPlans: allSortedPlans,
      });
      if (output) {
        valueForMoneyPlans = output.valueForMoneyPlans;
      }
    } catch (error) {
      console.error('AI value analysis failed, returning direct matches only.', error);
      // If the AI fails, we can still return the direct matches.
    }
    
    // Step 4: Combine the results and return.
    return {
      suggestedPlans,
      valueForMoneyPlans,
    };
  }
);
