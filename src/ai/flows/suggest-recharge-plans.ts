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
} from '@/ai/schemas';
import {getLiveRechargePlans, MOCK_PLANS} from '@/services/telecom-service';
import {z} from 'zod';

// Define the schema for the AI's analysis. It now receives the user's preferences,
// the full list of available plans, and a specific "baseline" plan to compare against.
const ValueAnalysisInputSchema = SuggestRechargePlansInputSchema.extend({
  allPlans: z.array(PlanSchema),
  baselinePlan: PlanSchema.optional().describe(
    "The best direct-match plan found for the user's request. Use this as the primary basis for comparison."
  ),
});

// The AI's output remains the value-for-money plans.
const ValueAnalysisOutputSchema = z.object({
  valueForMoneyPlans: z
    .array(
      PlanSchema.extend({
        reasoning: z
          .string()
          .describe(
            'A brief explanation of why this plan offers better long-term value compared to the baseline plan, including specific cost-per-day calculations or total savings.'
          ),
      })
    )
    .describe(
      'A list of plans that offer superior long-term value compared to the baseline.'
    ),
});

// The main function that the UI calls.
export async function suggestRechargePlans(
  input: SuggestRechargePlansInput
): Promise<SuggestRechargePlansOutput> {
  return suggestRechargePlansFlow(input);
}

// Define the prompt for the AI's value analysis task.
// Its only job is to find long-term deals compared to a specific baseline.
const valueAnalysisPrompt = ai.definePrompt({
  name: 'valueAnalysisPrompt',
  input: {schema: ValueAnalysisInputSchema},
  output: {schema: ValueAnalysisOutputSchema},
  prompt: `You are a meticulous financial analyst for a telecom comparison app. Your task is to find "hidden gem" plans that offer superior value compared to a user's baseline choice.

  User Preferences:
  - Daily Data Usage: {{dailyDataUsageGB}} GB/day
  - Validity: {{validityDays}} days
  - Telecom Provider: {{telecomProvider}}

  {{#if baselinePlan}}
  User's Best Direct Match (Baseline for Comparison):
  - Plan Name: {{baselinePlan.planName}}
  - Price: ₹{{baselinePlan.price}} for {{baselinePlan.validity}} days ({{baselinePlan.dailyData}} GB/day)
  - Cost per day: ₹{{divide baselinePlan.price baselinePlan.validity}}
  - Total Cost for 365 days (if recharged repeatedly): ₹{{multiply (divide baselinePlan.price baselinePlan.validity) 365}}
  {{else}}
  No direct match was found for the user's request.
  {{/if}}

  Full list of available plans for the provider to analyze:
  {{#each allPlans}}
  - {{this.planName}}: ₹{{this.price}} for {{this.validity}} days with {{this.dailyData}} GB/day. (Cost per day: ₹{{divide this.price this.validity}})
  {{/each}}

  Your Analysis Steps:
  1.  **Analyze the Baseline:** If a baseline plan is provided, calculate its cost per day and its total cost over a 365-day period. This is your primary benchmark. If no baseline is provided, you cannot perform an analysis, so return an empty list.
  2.  **Find Better Value:** Scrutinize the "Full list of available plans". Your goal is to find plans that are objectively better than the baseline. A plan is better if:
      - It has a lower cost per day for the same or more data.
      - It is a long-term plan (e.g., 84, 90, 365 days) that results in significant total savings compared to repeatedly recharging the baseline plan over the same period. **You MUST actively look for an annual plan (365 days) and calculate the total savings compared to the baseline's annual cost.**
  3.  **Generate Reasoning:** For each value plan you identify, you MUST write a compelling 'reasoning' statement. Be specific. **For long-term plans, you MUST calculate the total money saved over the year and state it clearly.** For example: "Choosing this annual plan saves you over ₹1,200 a year compared to recharging the 28-day plan every month."
  4.  **Output:** Populate the 'valueForMoneyPlans' list with your findings. If no plans offer a clear advantage over the baseline, return an empty list. Do not include the baseline plan in your output.
  `,
  template: {
    helpers: {
      divide: (a: number, b: number) => (b === 0 ? 0 : a / b).toFixed(2),
      multiply: (a: number, b: number) => (a * b).toFixed(0),
    },
  },
});

// Define the main flow.
const suggestRechargePlansFlow = ai.defineFlow(
  {
    name: 'suggestRechargePlansFlow',
    inputSchema: SuggestRechargePlansInputSchema,
    outputSchema: SuggestRechargePlansOutputSchema,
  },
  async (input) => {
    // Ensure numeric types for calculation
    const numericInput = {
      ...input,
      dailyDataUsageGB: Number(input.dailyDataUsageGB),
      validityDays: Number(input.validityDays),
    };

    const {exactMatchPlans, similarPlans} = await getLiveRechargePlans(
      numericInput
    );

    const baselinePlan =
      exactMatchPlans.length > 0 ? exactMatchPlans[0] : undefined;

    let valueForMoneyPlans: SuggestRechargePlansOutput['valueForMoneyPlans'] =
      [];

    if (baselinePlan) {
      try {
        let allProviderPlans = MOCK_PLANS.filter(
          (p) =>
            p.provider.toLowerCase() === numericInput.telecomProvider.toLowerCase()
        );

        // Filter out the baseline plan from the list sent to the AI.
        allProviderPlans = allProviderPlans.filter(
          (p) => p.planName !== baselinePlan.planName
        );

        const {output} = await valueAnalysisPrompt({
          ...numericInput,
          allPlans: allProviderPlans,
          baselinePlan: baselinePlan,
        });

        if (output) {
          valueForMoneyPlans = output.valueForMoneyPlans;
        }
      } catch (error) {
        console.error(
          'AI value analysis failed, returning direct matches only.',
          error
        );
      }
    }

    return {
      exactMatchPlans,
      similarPlans,
      valueForMoneyPlans,
    };
  }
);
