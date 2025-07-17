import type { SuggestRechargePlansInput, SuggestRechargePlansOutput } from '@/ai/schemas';

// This is a mock database of available recharge plans.
// In a real-world application, this data would come from an external API or a web scraper.
const MOCK_PLANS: (SuggestRechargePlansOutput['suggestedPlans'][0] & { provider: string })[] = [
  // Jio Plans
  { provider: 'Jio', planName: 'Freedom Plan 28', price: 299, validity: 28, dailyData: 1.5, totalData: 42, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Data-Max 28', price: 399, validity: 28, dailyData: 2.5, totalData: 70, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema, JioCloud', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Power User 28', price: 449, validity: 28, dailyData: 3, totalData: 84, otherBenefits: 'Unlimited Calls, 100 SMS/day, Disney+ Hotstar Mobile for 3 months', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Freedom Plan 56', price: 533, validity: 56, dailyData: 1.5, totalData: 84, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Data-Max 56', price: 666, validity: 56, dailyData: 2, totalData: 112, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema, JioCloud', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Value Pack 84', price: 719, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Super Saver 84', price: 899, validity: 84, dailyData: 2.5, totalData: 210, otherBenefits: 'Unlimited Calls, 100 SMS/day, Disney+ Hotstar Mobile', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Mega Data 84', price: 1066, validity: 84, dailyData: 3, totalData: 252, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema, JioCloud', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Annual Saver', price: 2879, validity: 365, dailyData: 2, totalData: 730, otherBenefits: 'Unlimited Calls, 100 SMS/day, JioTV, JioCinema', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Annual Data Pro', price: 3119, validity: 365, dailyData: 2.5, totalData: 912.5, otherBenefits: 'Unlimited Calls, 100 SMS/day, Disney+ Hotstar Mobile for 1 year', rechargeLink: '#' },

  // Real Airtel Plans from spreadsheet
  { provider: 'Airtel', planName: 'Airtel Annual Unlimited', price: 1799, validity: 365, dailyData: 0.06, totalData: 24, otherBenefits: 'Unlimited Calls, 3600 SMS, Apollo 24|7 Circle, Wynk Music', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 84 Day Unlimited', price: 999, validity: 84, dailyData: 2.5, totalData: 210, otherBenefits: 'Unlimited 5G Data, Airtel Xstream Play, Apollo 24|7 Circle', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 84 Day Hotstar', price: 839, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'Unlimited 5G Data, Disney+ Hotstar Mobile for 3 Months, Airtel Xstream Play', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 84 Day Value', price: 719, validity: 84, dailyData: 1.5, totalData: 126, otherBenefits: 'Unlimited 5G Data, Airtel Xstream Play, RewardsMini Subscription', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 56 Day Prime', price: 699, validity: 56, dailyData: 3, totalData: 168, otherBenefits: 'Unlimited 5G Data, Amazon Prime Membership, Airtel Xstream Play', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 77 Day Unlimited', price: 666, validity: 77, dailyData: 1.5, totalData: 115.5, otherBenefits: 'Unlimited 5G Data, Apollo 24|7 Circle, Wynk Music', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 56 Day Hotstar', price: 599, validity: 56, dailyData: 3, totalData: 168, otherBenefits: 'Unlimited 5G Data, Disney+ Hotstar Mobile, Airtel Xstream Play', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 56 Day Unlimited', price: 549, validity: 56, dailyData: 2, totalData: 112, otherBenefits: 'Unlimited 5G Data, Airtel Xstream Play, Apollo 24|7 Circle', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 28 Day Unlimited', price: 499, validity: 28, dailyData: 3, totalData: 84, otherBenefits: 'Unlimited 5G Data, Disney+ Hotstar Mobile for 3 Months, Airtel Xstream Play', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 28 Day Data', price: 359, validity: 28, dailyData: 2.5, totalData: 70, otherBenefits: 'Unlimited 5G Data, Airtel Xstream Play for 28 days', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 28 Day Value', price: 299, validity: 28, dailyData: 1.5, totalData: 42, otherBenefits: 'Unlimited 5G Data, Apollo 24|7 Circle, Wynk Music', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 28 Day Basic', price: 265, validity: 28, dailyData: 1, totalData: 28, otherBenefits: 'Unlimited 5G Data, Wynk Music Free', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 28 Day Starter', price: 239, validity: 28, dailyData: 1, totalData: 28, otherBenefits: 'Unlimited Calls, 100 SMS/Day, Wynk Music', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 24 Day Starter', price: 209, validity: 24, dailyData: 1, totalData: 24, otherBenefits: 'Unlimited Calls, 100 SMS/Day, Wynk Music', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Airtel 28 Day Base', price: 179, validity: 28, dailyData: 0.07, totalData: 2, otherBenefits: 'Unlimited Calls, 300 SMS, Wynk Music', rechargeLink: '#' }
];


/**
 * Fetches live recharge plans. This function is designed to be replaced with
 * a real implementation that scrapes data from provider websites.
 * @param input - The user's preferences for recharge plans.
 * @returns A promise that resolves to the suggested plans.
 */
export async function getLiveRechargePlans(
  input: SuggestRechargePlansInput
): Promise<SuggestRechargePlansOutput> {
  console.log('Filtering plans based on input:', input);
  
  // =================================================================
  // DEVELOPER TO-DO: Implement real-time data fetching here.
  //
  // This is the place to add your web scraping logic using libraries
  // like Puppeteer or Cheerio. You would scrape the websites of
  // telecom providers (Jio, Airtel, etc.) to get live plan data.
  //
  // The scraped data should be transformed into the same format as
  // the `MOCK_PLANS` above. The `input` object contains the user's
  // preferences which you can use to guide your scraping or filtering.
  //
  // For now, this function uses mock data for demonstration.
  // =================================================================

  const { dailyDataUsageGB, validityDays, telecomProvider } = input;

  const filteredByProvider = MOCK_PLANS.filter(
    plan => plan.provider.toLowerCase() === telecomProvider.toLowerCase()
  );

  if (filteredByProvider.length === 0) {
    return { suggestedPlans: [] };
  }
  
  const scoredPlans = filteredByProvider.map(plan => {
    const validityDiff = Math.abs(plan.validity - validityDays);
    const dataDiff = Math.abs(plan.dailyData - dailyDataUsageGB);

    // Lower score is better. Give more weight to data preference.
    const score = validityDiff * 0.3 + dataDiff * 0.7;

    return { ...plan, score };
  });

  const sortedPlans = scoredPlans.sort((a, b) => a.score - b.score);

  console.log(`Found ${sortedPlans.length} matching plans for ${telecomProvider}.`);

  return { suggestedPlans: sortedPlans.slice(0, 3) };
}
