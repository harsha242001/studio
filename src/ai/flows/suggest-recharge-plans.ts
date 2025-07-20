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
  - Look for any long-validity plans (e.g., 365 days, 90 days, 84 days).
  - Compare their cost-effectiveness against shorter-term plans. For example, calculate the cost of recharging a 28-day plan multiple times to cover the period of an 84-day or 365-day plan.
  - A plan is a "value-for-money" option if it is cheaper over time OR offers significantly better benefits (like more data) for a similar or slightly higher long-term cost.

  Step 2: Populate Value-for-Money Suggestions
  - If you find one or two plans that offer significant long-term savings or benefits, add them to the 'valueForMoneyPlans' list.
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
    // This gives us categorized lists of exact and similar matches.
    const { exactMatchPlans, similarPlans } = await getLiveRechargePlans(input);

    // Step 2: Ask the AI to perform only the value analysis.
    // We pass the user's input and the full list of plans to the AI.
    let valueForMoneyPlans: SuggestRechargePlansOutput['valueForMoneyPlans'] = [];
    try {
      // For value analysis, we need ALL plans, not just the pre-filtered ones
      const allProviderPlans = MOCK_PLANS.filter(p => p.provider.toLowerCase() === input.telecomProvider.toLowerCase());
      
      const {output} = await valueAnalysisPrompt({
        ...input,
        allPlans: allProviderPlans,
      });
      if (output) {
        valueForMoneyPlans = output.valueForMoneyPlans;
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

    