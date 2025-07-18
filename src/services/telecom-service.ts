'use server';

import type { SuggestRechargePlansInput, Plan } from '@/ai/schemas';

const MOCK_PLANS: Plan[] = [
  // Jio Plans
  { provider: 'Jio', planName: 'Netflix Premium', price: 1798, validity: 84, dailyData: 3, totalData: 252, otherBenefits: 'Netflix Basic, Unlimited 5G Data' },
  { provider: 'Jio', planName: 'Hotstar Super', price: 1729, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'Netflix Basic, JioHotstar Super' },
  { provider: 'Jio', planName: 'Jio Hotstar 84D', price: 1029, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'JioHotstar Mobile for 3 months, Unlimited 5G Data' },
  { provider: 'Jio', planName: 'Netflix Basic 28D', price: 598, validity: 28, dailyData: 2, totalData: 56, otherBenefits: 'Netflix Basic, JioHotstar Super' },
  { provider: 'Jio', planName: 'Jio Hotstar 28D', price: 398, validity: 28, dailyData: 2, totalData: 56, otherBenefits: 'JioHotstar Mobile for 28 days, Unlimited 5G Data' },
  { provider: 'Jio', planName: 'Jio Hotstar Annual', price: 3999, validity: 365, dailyData: 2.5, totalData: 912.5, otherBenefits: 'JioHotstar Mobile for 1 year, Unlimited 5G Data' },
  { provider: 'Jio', planName: 'Annual 2.5GB/Day', price: 2999, validity: 365, dailyData: 2.5, totalData: 912.5, otherBenefits: 'Unlimited 5G Data' },

  // Airtel Plans
  { provider: 'Airtel', planName: 'Prime Lite Pack', price: 1199, validity: 84, dailyData: 2.5, totalData: 210, otherBenefits: 'Amazon Prime Lite, Unlimited 5G Data' },
  { provider: 'Airtel', planName: 'Xstream Play 84D', price: 979, validity: 84, dailyData: 2, totalData: 168, otherBenefits: 'Airtel Xstream Play Premium (includes 22+ OTTs), Unlimited 5G Data' },
  { provider: 'Airtel', planName: 'Prime Lite 56D', price: 838, validity: 56, dailyData: 3, totalData: 168, otherBenefits: 'Amazon Prime Lite, Unlimited 5G Data' },
  { provider: 'Airtel', planName: 'Xstream Play 28D', price: 449, validity: 28, dailyData: 3, totalData: 84, otherBenefits: 'Airtel Xstream Play Premium (includes 22+ OTTs), Unlimited 5G Data' },
  { provider: 'Airtel', planName: 'Annual 2GB/Day', price: 3599, validity: 365, dailyData: 2, totalData: 730, otherBenefits: 'Unlimited 5G Data, India\'s 1st Spam Fighting Network' },
  { provider: 'Airtel', planName: 'Value Pack 90D', price: 929, validity: 90, dailyData: 1.5, totalData: 135, otherBenefits: 'India\'s 1st Spam Fighting Network, Watch free TV shows, Movies, Live channels and much more' },
  { provider: 'Airtel', planName: 'RewardsMini 84D', price: 859, validity: 84, dailyData: 1.5, totalData: 126, otherBenefits: 'RewardsMini Subscription' },
  { provider: 'Airtel', planName: 'HelloTunes 77D', price: 799, validity: 77, dailyData: 1.5, totalData: 115.5, otherBenefits: 'Free hellotunes for you' },
  { provider: 'Airtel', planName: 'Data Pack 56D', price: 649, validity: 56, dailyData: 2, totalData: 112, otherBenefits: 'Unlimited 5G Data, India\'s 1st Spam Fighting Network' },
  { provider: 'Airtel', planName: 'Data Pack 60D', price: 619, validity: 60, dailyData: 1.5, totalData: 90, otherBenefits: 'India\'s 1st Spam Fighting Network, Watch free TV shows, Movies, Live channels and much more' },
  { provider: 'Airtel', planName: 'Data Pack 56D', price: 579, validity: 56, dailyData: 1.5, totalData: 84, otherBenefits: 'Watch free TV shows, Movies, Live channels and much more' },
  { provider: 'Airtel', planName: 'Monthly 2.5GB', price: 429, validity: 30, dailyData: 2.5, totalData: 75, otherBenefits: 'Unlimited 5G Data, India\'s 1st Spam Fighting Network' },
  { provider: 'Airtel', planName: 'Monthly 2GB', price: 379, validity: 30, dailyData: 2, totalData: 60, otherBenefits: 'India\'s 1st Spam Fighting Network' },
  { provider: 'Airtel', planName: 'HelloTunes 28D', price: 349, validity: 28, dailyData: 1.5, totalData: 42, otherBenefits: 'Free hellotunes for you' },
  { provider: 'Airtel', planName: 'HelloTunes 28D 1GB', price: 299, validity: 28, dailyData: 1, totalData: 28, otherBenefits: 'Free hellotunes for you' },
  { provider: 'Airtel', planName: 'Basic 24D', price: 249, validity: 24, dailyData: 1, totalData: 24, otherBenefits: 'Watch free TV shows, Movies, Live channels and much more' },
];


export async function getLiveRechargePlans(
  input: SuggestRechargePlansInput
): Promise<{ exactMatchPlans: Plan[]; similarPlans: Plan[] }> {
  console.log('Filtering plans based on input:', input);

  const { dailyDataUsageGB, validityDays, telecomProvider } = input;

  const providerPlans = MOCK_PLANS.filter(
    (plan) => plan.provider.toLowerCase() === telecomProvider.toLowerCase()
  );

  const exactMatchPlans = providerPlans.filter(
    (plan) =>
      plan.dailyData === dailyDataUsageGB && plan.validity === validityDays
  );

  const similarPlans = providerPlans
    .filter(
      (plan) =>
        plan.dailyData === dailyDataUsageGB && plan.validity !== validityDays
    )
    .map((plan) => ({
      ...plan,
      // Score based on how close the validity is
      score: Math.abs(plan.validity - validityDays),
    }))
    .sort((a, b) => a.score - b.score);

  console.log(`Found ${exactMatchPlans.length} exact matches and ${similarPlans.length} similar matches.`);

  return { exactMatchPlans, similarPlans };
}
