'use server';

import type { SuggestRechargePlansInput, SuggestRechargePlansOutput } from '@/ai/schemas';

// This is a database of available recharge plans based on user-provided data.
// In a real-world application, this data could come from a live API or a web scraper.
const MOCK_PLANS: (SuggestRechargePlansOutput['suggestedPlans'][0] & { provider: string })[] = [
  // Plans from user-provided screenshot
  { provider: 'Jio', planName: 'Netflix Premium', price: 1798, validity: 84, dailyData: 3, totalData: 252, otherBenefits: 'Netflix Basic, Unlimited 5G Data', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Hotstar Super', price: 1729, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'Netflix Basic, JioHotstar Super', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Prime Lite Pack', price: 1199, validity: 84, dailyData: 2.5, totalData: 210, otherBenefits: 'Amazon Prime Lite, Unlimited 5G Data', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Jio Hotstar 84D', price: 1029, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'JioHotstar Mobile for 3 months, Unlimited 5G Data', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Xstream Play 84D', price: 979, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'Airtel Xstream Play Premium (includes 22+ OTTs), Unlimited 5G Data', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Prime Lite 56D', price: 838, validity: 56, dailyData: 3, totalData: 168, otherBenefits: 'Amazon Prime Lite, Unlimited 5G Data', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Netflix Basic 28D', price: 598, validity: 28, dailyData: 2, totalData: 56, otherBenefits: 'Netflix Basic, JioHotstar Super', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Xstream Play 28D', price: 449, validity: 28, dailyData: 3, totalData: 84, otherBenefits: 'Airtel Xstream Play Premium (includes 22+ OTTs), Unlimited 5G Data', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Jio Hotstar 28D', price: 398, validity: 28, dailyData: 2, totalData: 56, otherBenefits: 'JioHotstar Mobile for 28 days, Unlimited 5G Data', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Annual 2GB/Day', price: 3599, validity: 365, dailyData: 2, totalData: 730, otherBenefits: 'Unlimited 5G Data, India\'s 1st Spam Fighting Network', rechargeLink: '#' },
  { provider: 'Jio', planName: 'Jio Hotstar Annual', price: 3999, validity: 365, dailyData: 2.5, totalData: 912.5, otherBenefits: 'JioHotstar Mobile for 1 year, Unlimited 5G Data', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Value Pack 90D', price: 929, validity: 90, dailyData: 1.5, totalData: 135, otherBenefits: 'India\'s 1st Spam Fighting Network, Watch free TV shows, Movies, Live channels and much more', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'RewardsMini 84D', price: 859, validity: 84, dailyData: 1.5, totalData: 126, otherBenefits: 'RewardsMini Subscription', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'HelloTunes 77D', price: 799, validity: 77, dailyData: 1.5, totalData: 115.5, otherBenefits: 'Free hellotunes for you', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Data Pack 56D', price: 649, validity: 56, dailyData: 2, totalData: 112, otherBenefits: 'Unlimited 5G Data, India\'s 1st Spam Fighting Network', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Data Pack 60D', price: 619, validity: 60, dailyData: 1.5, totalData: 90, otherBenefits: 'India\'s 1st Spam Fighting Network, Watch free TV shows, Movies, Live channels and much more', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Data Pack 56D', price: 579, validity: 56, dailyData: 1.5, totalData: 84, otherBenefits: 'Watch free TV shows, Movies, Live channels and much more', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Monthly 2.5GB', price: 429, validity: 30, dailyData: 2.5, totalData: 75, otherBenefits: 'Unlimited 5G Data, India\'s 1st Spam Fighting Network', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Monthly 2GB', price: 379, validity: 30, dailyData: 2, totalData: 60, otherBenefits: 'India\'s 1st Spam Fighting Network', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'HelloTunes 28D', price: 349, validity: 28, dailyData: 1.5, totalData: 42, otherBenefits: 'Free hellotunes for you', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'HelloTunes 28D 1GB', price: 299, validity: 28, dailyData: 1, totalData: 28, otherBenefits: 'Free hellotunes for you', rechargeLink: '#' },
  { provider: 'Airtel', planName: 'Basic 24D', price: 249, validity: 24, dailyData: 1, totalData: 24, otherBenefits: 'Watch free TV shows, Movies, Live channels and much more', rechargeLink: '#' },
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
    // Calculate the "distance" from the user's preferences. Lower is better.
    // We penalize plans that are "less than" what the user asked for more heavily.
    const validityDiff = plan.validity >= validityDays ? (plan.validity - validityDays) * 0.5 : (validityDays - plan.validity) * 2;
    const dataDiff = plan.dailyData >= dailyDataUsageGB ? (plan.dailyData - dailyDataUsageGB) : (dailyDataUsageGB - plan.dailyData) * 2;

    // We give slightly more weight to matching the data preference.
    const score = validityDiff * 0.4 + dataDiff * 0.6;

    return { ...plan, score };
  });

  const sortedPlans = scoredPlans.sort((a, b) => a.score - b.score);

  console.log(`Found ${sortedPlans.length} matching plans for ${telecomProvider}.`);

  return { suggestedPlans: sortedPlans.slice(0, 3) };
}
