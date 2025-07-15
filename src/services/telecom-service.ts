import type { SuggestRechargePlansInput, SuggestRechargePlansOutput } from '@/ai/schemas';

// This is a mock database of available recharge plans.
// In a real-world application, this data would come from an external API.
const MOCK_PLANS: SuggestRechargePlansOutput['suggestedPlans'] = [
  // 28 Day Plans
  { planName: 'Freedom Plan 28', price: 299, validity: 28, dailyData: 1.5, totalData: 42, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema', rechargeLink: '#' },
  { planName: 'Data-Max 28', price: 399, validity: 28, dailyData: 2.5, totalData: 70, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema, JioCloud', rechargeLink: '#' },
  { planName: 'Power User 28', price: 449, validity: 28, dailyData: 3, totalData: 84, otherBenefits: 'Unlimited Calls, 100 SMS/day, Disney+ Hotstar Mobile for 3 months', rechargeLink: '#' },

  // 56 Day Plans
  { planName: 'Freedom Plan 56', price: 533, validity: 56, dailyData: 1.5, totalData: 84, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema', rechargeLink: '#' },
  { planName: 'Data-Max 56', price: 666, validity: 56, dailyData: 2, totalData: 112, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema, JioCloud', rechargeLink: '#' },

  // 84 Day Plans
  { planName: 'Value Pack 84', price: 719, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema', rechargeLink: '#' },
  { planName: 'Super Saver 84', price: 899, validity: 84, dailyData: 2.5, totalData: 210, otherBenefits: 'Unlimited Calls, 100 SMS/day, Disney+ Hotstar Mobile', rechargeLink: '#' },
  { planName: 'Mega Data 84', price: 1066, validity: 84, dailyData: 3, totalData: 252, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema, JioCloud', rechargeLink: '#' },
  
  // 365 Day (Annual) Plans
  { planName: 'Annual Saver', price: 2879, validity: 365, dailyData: 2, totalData: 730, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema', rechargeLink: '#' },
  { planName: 'Annual Data Pro', price: 3119, validity: 365, dailyData: 2.5, totalData: 912.5, otherBenefits: 'Unlimited Calls, 100 SMS/day, Disney+ Hotstar Mobile for 1 year', rechargeLink: '#' },
];


/**
 * Simulates fetching live recharge plans from a telecom provider's API.
 * It filters the mock database based on user preferences.
 * @param input - The user's preferences for recharge plans.
 * @returns A promise that resolves to the suggested plans.
 */
export async function getLiveRechargePlans(
  input: SuggestRechargePlansInput
): Promise<SuggestRechargePlansOutput> {
  console.log('Filtering plans based on input:', input);
  
  const { dailyDataUsageGB, validityDays } = input;

  // Simple filtering logic:
  // Find plans that match the validity period exactly.
  // Then, from those, find plans where the daily data is greater than or equal to the user's request.
  const filteredPlans = MOCK_PLANS.filter(plan => {
    const validityMatch = plan.validity === validityDays;
    const dataMatch = plan.dailyData >= dailyDataUsageGB;
    return validityMatch && dataMatch;
  });

  // Sort by price to show the cheapest matching plan first.
  const sortedPlans = filteredPlans.sort((a, b) => a.price - b.price);

  console.log(`Found ${sortedPlans.length} matching plans.`);

  // To make it more realistic, we'll return a maximum of 3 plans.
  return { suggestedPlans: sortedPlans.slice(0, 3) };
}
