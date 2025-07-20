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

// Define the schema for the AI's analysis. It now receives the user's preferences,
// the full list of available plans, and a specific "baseline" plan to compare against.
const ValueAnalysisInputSchema = SuggestRechargePlansInputSchema.extend({
  allPlans: z.array(PlanSchema),
  baselinePlan: PlanSchema.optional().describe('The best direct-match plan found for the user\'s request. Use this as the primary basis for comparison.'),
});

// The AI's output remains the value-for-money plans.
const ValueAnalysisOutputSchema = z.object({
  valueForMoneyPlans: z.array(
    PlanSchema.extend({
      reasoning: z
        .string()
        .describe(
          'A brief explanation of why this plan offers better long-term value compared to the baseline plan, including specific cost-per-day calculations or total savings.'
        ),
    })
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
  {{else}}
  No direct match was found for the user's request.
  {{/if}}

  Full list of available plans for the provider:
  {{#each allPlans}}
  - {{this.planName}}: ₹{{this.price}} for {{this.validity}} days with {{this.dailyData}} GB/day. (Cost per day: ₹{{divide this.price this.validity}})
  {{/each}}

  Your Analysis Steps:
  1.  **Analyze the Baseline:** If a baseline plan is provided, calculate its cost per day. This is your primary benchmark.
  2.  **Find Better Value:** Scrutinize the "Full list of available plans". Your goal is to find plans that are objectively better than the baseline. A plan is better if:
      - It has a lower cost per day for the same or more data.
      - It offers significantly more data or longer validity for a marginally higher cost per day.
      - It's a long-term plan (e.g., 84, 90, 365 days) that results in significant total savings compared to repeatedly recharging the baseline plan over the same period.
  3.  **Generate Reasoning:** For each value plan you identify, you MUST write a compelling 'reasoning' statement. Be specific. Compare the cost per day or the total cost over a year directly against the baseline plan. For example: "This 84-day plan costs ₹9.8/day, which is cheaper than the baseline's ₹10.6/day, and you get the same data." or "Choosing this annual plan saves you ₹949 over a year compared to recharging the baseline monthly plan."
  4.  **Output:** Populate the 'valueForMoneyPlans' list with your findings. If no plans offer a clear advantage over the baseline, return an empty list. Do not include the baseline plan in your output.
  `,
  // Register a Handlebars helper to perform division.
  template: {
    helpers: {
      divide: (a: number, b: number) => (b === 0 ? 0 : (a / b).toFixed(2)),
    }
  }
});

// Define the main flow.
const suggestRechargePlansFlow = ai.defineFlow(
  {
    name: 'suggestRechargePlansFlow',
    inputSchema: SuggestRechargePlansInputSchema,
    outputSchema: SuggestRechargePlansOutputSchema,
  },
  async (input) => {
    // Step 1: Get categorized plans using our reliable TypeScript function.
    const { exactMatchPlans, similarPlans } = await getLiveRechargePlans(input);

    // Identify the best exact match to use as a baseline for the AI.
    // If multiple exact matches exist, we'll pick the first one.
    const baselinePlan = exactMatchPlans.length > 0 ? exactMatchPlans[0] : undefined;

    // Step 2: Ask the AI to perform only the value analysis, anchored to our baseline.
    let valueForMoneyPlans: SuggestRechargePlansOutput['valueForMoneyPlans'] = [];
    try {
      // For value analysis, we need ALL plans for the provider.
      const allProviderPlans = MOCK_PLANS.filter(p => p.provider.toLowerCase() === input.telecomProvider.toLowerCase());
      
      const {output} = await valueAnalysisPrompt({
        ...input,
        allPlans: allProviderPlans,
        baselinePlan: baselinePlan,
      });

      if (output) {
        // Filter out the baseline plan from the AI's suggestions if it happens to be there.
        valueForMoneyPlans = output.valueForMoneyPlans.filter(p => p.planName !== baselinePlan?.planName);
      }
    } catch (error) {
      console.error('AI value analysis failed, returning direct matches only.', error);
      // If the AI fails, we can still return the direct matches.
    }
    
    // Step 3: Combine the results and return.
    return {
      exactMatchPlans,
      similarPlans,
      valueForMoneyPlans,
    };
  }
);

// We need to provide the full list of plans to the flow, so we import it here.
const MOCK_PLANS: Plan[] = [
  // Jio Plans
  { provider: 'Jio', planName: 'Netflix Premium', price: 1798, validity: 84, dailyData: 3, totalData: 252, otherBenefits: 'Netflix Basic, Unlimited 5G Data', rechargeLink: 'https://www.jio.com/selfcare/plans/mobility/prepaid-plans-details/?planId=1798' },
  { provider: 'Jio', planName: 'Hotstar Super', price: 1729, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'Netflix Basic, JioHotstar Super', rechargeLink: 'https://www.jio.com/selfcare/plans/mobility/prepaid-plans-details/?planId=1729' },
  { provider: 'Jio', planName: 'Jio Hotstar 84D', price: 1029, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'JioHotstar Mobile for 3 months, Unlimited 5G Data', rechargeLink: 'https://www.jio.com/selfcare/plans/mobility/prepaid-plans-details/?planId=1029' },
  { provider: 'Jio', planName: 'Netflix Basic 28D', price: 598, validity: 28, dailyData: 2, totalData: 56, otherBenefits: 'Netflix Basic, JioHotstar Super', rechargeLink: 'https://www.jio.com/selfcare/plans/mobility/prepaid-plans-details/?planId=598' },
  { provider: 'Jio', planName: 'Jio Hotstar 28D', price: 398, validity: 28, dailyData: 2, totalData: 56, otherBenefits: 'JioHotstar Mobile for 28 days, Unlimited 5G Data', rechargeLink: 'https://www.jio.com/selfcare/plans/mobility/prepaid-plans-details/?planId=398' },
  { provider: 'Jio', planName: 'Jio Hotstar Annual', price: 3999, validity: 365, dailyData: 2.5, totalData: 912.5, otherBenefits: 'JioHotstar Mobile for 1 year, Unlimited 5G Data', rechargeLink: 'https://www.jio.com/selfcare/plans/mobility/prepaid-plans-details/?planId=3999' },
  { provider: 'Jio', planName: 'Annual 2.5GB/Day', price: 2999, validity: 365, dailyData: 2.5, totalData: 912.5, otherBenefits: 'Unlimited 5G Data', rechargeLink: 'https://www.jio.com/selfcare/plans/mobility/prepaid-plans-details/?planId=2999' },

  // Airtel Plans
  { provider: 'Airtel', planName: 'Prime Lite Pack', price: 1199, validity: 84, dailyData: 2.5, totalData: 210, otherBenefits: 'Amazon Prime Lite, Unlimited 5G Data', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Xstream Play 84D', price: 979, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'Airtel Xstream Play Premium (includes 22+ OTTs), Unlimited 5G Data', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Prime Lite 56D', price: 838, validity: 56, dailyData: 3, totalData: 168, otherBenefits: 'Amazon Prime Lite, Unlimited 5G Data', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Xstream Play 28D', price: 449, validity: 28, dailyData: 3, totalData: 84, otherBenefits: 'Airtel Xstream Play Premium (includes 22+ OTTs), Unlimited 5G Data', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Annual 2GB/Day', price: 3599, validity: 365, dailyData: 2, totalData: 730, otherBenefits: 'Unlimited 5G Data, India\'s 1st Spam Fighting Network', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Value Pack 90D', price: 929, validity: 90, dailyData: 1.5, totalData: 135, otherBenefits: 'India\'s 1st Spam Fighting Network, Watch free TV shows, Movies, Live channels and much more', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'RewardsMini 84D', price: 859, validity: 84, dailyData: 1.5, totalData: 126, otherBenefits: 'RewardsMini Subscription', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'HelloTunes 77D', price: 799, validity: 77, dailyData: 1.5, totalData: 115.5, otherBenefits: 'Free hellotunes for you', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Data Pack 56D', price: 649, validity: 56, dailyData: 2, totalData: 112, otherBenefits: 'Unlimited 5G Data, India\'s 1st Spam Fighting Network', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Data Pack 60D', price: 619, validity: 60, dailyData: 1.5, totalData: 90, otherBenefits: 'India\'s 1st Spam Fighting Network, Watch free TV shows, Movies, Live channels and much more', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Data Pack 56D', price: 579, validity: 56, dailyData: 1.5, totalData: 84, otherBenefits: 'Watch free TV shows, Movies, Live channels and much more', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Monthly 2.5GB', price: 429, validity: 30, dailyData: 2.5, totalData: 75, otherBenefits: 'Unlimited 5G Data, India\'s 1st Spam Fighting Network', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Monthly 2GB', price: 379, validity: 30, dailyData: 2, totalData: 60, otherBenefits: 'India\'s 1st Spam Fighting Network', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'HelloTunes 28D', price: 349, validity: 28, dailyData: 1.5, totalData: 42, otherBenefits: 'Free hellotunes for you', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'HelloTunes 28D 1GB', price: 299, validity: 28, dailyData: 1, totalData: 28, otherBenefits: 'Free hellotunes for you', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
  { provider: 'Airtel', planName: 'Basic 24D', price: 249, validity: 24, dailyData: 1, totalData: 24, otherBenefits: 'Watch free TV shows, Movies, Live channels and much more', rechargeLink: 'https://www.airtel.in/recharge/prepaid' },
];