'use client';

import { useState } from 'react';
import type { z } from 'zod';
import { suggestRechargePlans } from '@/ai/flows/suggest-recharge-plans';
import type { SuggestRechargePlansOutput, SuggestRechargePlansInput } from '@/ai/schemas';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RechargeForm } from '@/components/recharge-form';
import { PlanCard } from '@/components/plan-card';
import { PlanSkeleton } from '@/components/plan-skeleton';
import { WifiOff, BrainCircuit } from 'lucide-react';

export default function Home() {
  const [exactMatchPlans, setExactMatchPlans] = useState<SuggestRechargePlansOutput['exactMatchPlans'] | null>(null);
  const [similarPlans, setSimilarPlans] = useState<SuggestRechargePlansOutput['similarPlans'] | null>(null);
  const [valueForMoneyPlans, setValueForMoneyPlans] = useState<SuggestRechargePlansOutput['valueForMoneyPlans'] | null>(null);
  const [rawOutput, setRawOutput] = useState<SuggestRechargePlansOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (data: SuggestRechargePlansInput) => {
    setIsLoading(true);
    setExactMatchPlans(null);
    setSimilarPlans(null);
    setValueForMoneyPlans(null);
    setRawOutput(null);
    try {
      const result = await suggestRechargePlans(data);
      setRawOutput(result); // Store raw output for debugging
      if (result.exactMatchPlans) {
        setExactMatchPlans(result.exactMatchPlans);
      }
      if (result.similarPlans) {
        setSimilarPlans(result.similarPlans);
      }
      if (result.valueForMoneyPlans) {
        setValueForMoneyPlans(result.valueForMoneyPlans);
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem fetching recharge plans. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasNoResults = !isLoading &&
    (!exactMatchPlans || exactMatchPlans.length === 0) &&
    (!similarPlans || similarPlans.length === 0) &&
    (!valueForMoneyPlans || valueForMoneyPlans.length === 0);


  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">RechargeAce</h1>
          <p className="text-muted-foreground mt-2 md:text-xl">
            Find your perfect mobile recharge plan effortlessly.
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Tell us what you need</CardTitle>
              <CardDescription>We'll find the best plans for you, plus some smart deals!</CardDescription>
            </CardHeader>
            <CardContent>
              <RechargeForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </CardContent>
          </Card>

          <div className="mt-12">
            {isLoading && (
              <div className="grid gap-6 md:grid-cols-2">
                <PlanSkeleton />
                <PlanSkeleton />
              </div>
            )}

            {valueForMoneyPlans && valueForMoneyPlans.length > 0 && (
              <div className="mb-12">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold inline-flex items-center gap-2">
                    <BrainCircuit className="h-8 w-8 text-accent" />
                    Smart Suggestions for Long-Term Value
                  </h2>
                   <p className="text-muted-foreground mt-1">These plans could save you money over time.</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {valueForMoneyPlans.map((plan, index) => (
                    <PlanCard key={`value-${index}`} plan={plan} isFeatured={true} />
                  ))}
                </div>
              </div>
            )}

            {exactMatchPlans && exactMatchPlans.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-center mb-6">Your Exact Match</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {exactMatchPlans.map((plan, index) => (
                    <PlanCard key={`exact-${index}`} plan={plan} />
                  ))}
                </div>
              </div>
            )}

            {similarPlans && similarPlans.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-center mb-6">Similar Plans You Might Like</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {similarPlans.map((plan, index) => (
                    <PlanCard key={`similar-${index}`} plan={plan} />
                  ))}
                </div>
              </>
            )}
            
            {hasNoResults && (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center bg-secondary text-secondary-foreground rounded-full p-4 mb-4">
                        <WifiOff className="h-10 w-10"/>
                    </div>
                    <h3 className="text-xl font-semibold">No Plans Found</h3>
                    <p className="text-muted-foreground mt-2">We couldn't find any plans matching your criteria. Try adjusting your preferences.</p>
                </div>
            )}
          </div>
        </main>

        {rawOutput && (
          <Card className="mt-8 max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Debug Output</CardTitle>
              <CardDescription>Raw data returned from the backend logic.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-secondary rounded-md text-xs overflow-auto">
                {JSON.stringify(rawOutput, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
