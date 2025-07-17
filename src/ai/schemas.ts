import {z} from 'zod';

// Define the input schema for the flow
export const SuggestRechargePlansInputSchema = z.object({
  dailyDataUsageGB: z.number().describe('The amount of data the user needs per day, in GB.'),
  validityDays: z.number().describe('The desired validity period for the recharge plan, in days.'),
  telecomProvider: z.string().describe('The telecom provider (e.g., Jio, Airtel).'),
  location: z.string().optional().describe('The user’s location to filter plans.'),
});
export type SuggestRechargePlansInput = z.infer<typeof SuggestRechargePlansInputSchema>;

const PlanSchema = z.object({
  provider: z.string().describe('The telecom provider of the plan.'),
  planName: z.string().describe('The name of the recharge plan.'),
  price: z.number().describe('The price of the recharge plan.'),
  validity: z.number().describe('The validity period of the plan, in days.'),
  dailyData: z.number().describe('The daily data limit, in GB.'),
  totalData: z.number().describe('The total data offered by the plan, in GB.'),
  otherBenefits: z.string().optional().describe('Other benefits offered by the plan.'),
  rechargeLink: z.string().optional().describe('The link to recharge the plan.'),
});

// Define the output schema for the flow
export const SuggestRechargePlansOutputSchema = z.object({
  suggestedPlans: z.array(PlanSchema).describe('A list of up to 3 recharge plans that are a direct match for the user’s preferences.'),
  valueForMoneyPlans: z.array(
    PlanSchema.extend({
      reasoning: z.string().describe("A brief explanation of why this plan offers better long-term value, including the potential savings compared to recharging a shorter-term plan over the same period."),
    })
  ).describe("A list of up to 2 plans that offer better long-term value, such as annual plans that are cheaper over time than repeatedly buying a monthly plan. Only include plans here if they offer significant savings or benefits."),
});
export type SuggestRechargePlansOutput = z.infer<typeof SuggestRechargePlansOutputSchema>;
