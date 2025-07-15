import {z} from 'zod';

// Define the input schema for the flow
export const SuggestRechargePlansInputSchema = z.object({
  dailyDataUsageGB: z.number().describe('The amount of data the user needs per day, in GB.'),
  validityDays: z.number().describe('The desired validity period for the recharge plan, in days.'),
  telecomProvider: z.string().optional().describe('The telecom provider (e.g., Jio, Airtel, Vodafone).'),
  location: z.string().optional().describe('The user’s location to filter plans.'),
});
export type SuggestRechargePlansInput = z.infer<typeof SuggestRechargePlansInputSchema>;

// Define the output schema for the flow
export const SuggestRechargePlansOutputSchema = z.object({
  suggestedPlans: z.array(
    z.object({
      planName: z.string().describe('The name of the recharge plan.'),
      price: z.number().describe('The price of the recharge plan.'),
      validity: z.number().describe('The validity period of the plan, in days.'),
      dailyData: z.number().describe('The daily data limit, in GB.'),
      totalData: z.number().describe('The total data offered by the plan, in GB.'),
      otherBenefits: z.string().optional().describe('Other benefits offered by the plan.'),
      rechargeLink: z.string().optional().describe('The link to recharge the plan.'),
    })
  ).describe('A list of suggested recharge plans that match the user’s preferences.'),
});
export type SuggestRechargePlansOutput = z.infer<typeof SuggestRechargePlansOutputSchema>;
