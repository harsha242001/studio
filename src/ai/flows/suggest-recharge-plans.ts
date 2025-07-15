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

// Define the main function that will be called
export async function suggestRechargePlans(input: SuggestRechargePlansInput): Promise<SuggestRechargePlansOutput> {
  return suggestRechargePlansFlow(input);
}

// Define the prompt
const prompt = ai.definePrompt({
  name: 'suggestRechargePlansPrompt',
  input: {schema: SuggestRechargePlansInputSchema},
  output: {schema: SuggestRechargePlansOutputSchema},
  prompt: `You are a recharge plan recommendation expert. Based on the user's data usage and validity preferences, suggest some recharge plans.

  User Preferences:
  - Daily Data Usage: {{dailyDataUsageGB}} GB/day
  - Validity: {{validityDays}} days
  {{#if telecomProvider}}
  - Telecom Provider: {{telecomProvider}}
  {{/if}}
  {{#if location}}
  - Location: {{location}}
  {{/if}}

  Suggest recharge plans that closely match these preferences. Provide the plan name, price, validity, daily data, total data, other benefits, and a link to recharge the plan, if available. Focus on plans that provides close match to data usage and validity period.
  Return the result as JSON object.
  `,
});

// Define the flow
const suggestRechargePlansFlow = ai.defineFlow(
  {
    name: 'suggestRechargePlansFlow',
    inputSchema: SuggestRechargePlansInputSchema,
    outputSchema: SuggestRechargePlansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
