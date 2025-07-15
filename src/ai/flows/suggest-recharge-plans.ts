'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting recharge plans based on user preferences.
 *
 * The flow takes user inputs such as daily data usage and validity preferences, and returns a list of suggested recharge plans.
 * It includes:
 * - suggestRechargePlans: The main function to trigger the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  SuggestRechargePlansInput,
  SuggestRechargePlansInputSchema,
  SuggestRechargePlansOutput,
  SuggestRechargePlansOutputSchema,
} from '@/ai/schemas';
import {getLiveRechargePlans} from '@/services/telecom-service';

// Define the tool for fetching live recharge plans
const getLiveRechargePlansTool = ai.defineTool(
  {
    name: 'getLiveRechargePlans',
    description: 'Get a list of currently available recharge plans from telecom providers.',
    inputSchema: SuggestRechargePlansInputSchema,
    outputSchema: SuggestRechargePlansOutputSchema,
  },
  async (input) => {
    console.log('Using getLiveRechargePlans tool with input:', input);
    // In a real app, this would call an external API.
    // Here, we are calling our mock service.
    return getLiveRechargePlans(input);
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
  prompt: `You are a recharge plan recommendation expert. 
  
  Your primary goal is to help the user find the best mobile recharge plan based on their needs.

  IMPORTANT: First, you MUST use the 'getLiveRechargePlans' tool to fetch the latest available plans based on the user's preferences for daily data, validity, provider, and location.

  Once you have the list of live plans from the tool, analyze them and present the most suitable options to the user. If the tool returns no plans, inform the user that no plans could be found for their criteria.

  User Preferences:
  - Daily Data Usage: {{dailyDataUsageGB}} GB/day
  - Validity: {{validityDays}} days
  {{#if telecomProvider}}
  - Telecom Provider: {{telecomProvider}}
  {{/if}}
  {{#if location}}
  - Location: {{location}}
  {{/if}}
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
