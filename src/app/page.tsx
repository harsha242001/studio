'use client';

import { useState, useEffect } from 'react';
import type { z } from 'zod';
import { suggestRechargePlans } from '@/ai/flows/suggest-recharge-plans';
import type { SuggestRechargePlansOutput, SuggestRechargePlansInput } from '@/ai/schemas';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RechargeForm } from '@/components/recharge-form';
import { PlanCard } from '@/components/plan-card';
import { PlanSkeleton } from '@/components/plan-skeleton';
import { WifiOff, BrainCircuit, Sparkles, TrendingUp, Zap, Smartphone, Globe, Star } from 'lucide-react';

export default function Home() {
  const [exactMatchPlans, setExactMatchPlans] = useState<SuggestRechargePlansOutput['exactMatchPlans'] | null>(null);
  const [similarPlans, setSimilarPlans] = useState<SuggestRechargePlansOutput['similarPlans'] | null>(null);
  const [valueForMoneyPlans, setValueForMoneyPlans] = useState<SuggestRechargePlansOutput['valueForMoneyPlans'] | null>(null);
  const [rawOutput, setRawOutput] = useState<SuggestRechargePlansOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animateHeader, setAnimateHeader] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setAnimateHeader(true);
  }, []);

  const handleFormSubmit = async (data: SuggestRechargePlansInput) => {
    setIsLoading(true);
    setExactMatchPlans(null);
    setSimilarPlans(null);
    setValueForMoneyPlans(null);
    setRawOutput(null);
    try {
      const result = await suggestRechargePlans(data);
      setRawOutput(result);
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-20 left-20 sm:top-40 sm:left-40 w-40 h-40 sm:w-80 sm:h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 relative z-10">
        {/* Hero Header */}
        <header className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className={`transition-all duration-1000 ${animateHeader ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 animate-pulse" />
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                RechargeAce
              </h1>
              <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 ml-2 sm:ml-3 animate-pulse" />
            </div>
            <p className="text-slate-300 mt-3 sm:mt-4 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-4">
              Discover your perfect mobile recharge plan with AI-powered insights and 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold"> smart recommendations</span>
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 max-w-4xl mx-auto px-2">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <Smartphone className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-slate-300 text-xs sm:text-sm">Smart plan recommendations based on your usage patterns</p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-pink-400 group-hover:text-pink-300 transition-colors" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Value Analysis</h3>
                <p className="text-slate-300 text-xs sm:text-sm">Find the best long-term value and savings</p>
              </div>
            </div>
            
            <div className="group relative sm:col-span-2 md:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <Globe className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Instant Results</h3>
                <p className="text-slate-300 text-xs sm:text-sm">Get personalized plans in seconds</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto">
          {/* Interactive Form Card */}
          <div className="group relative mb-12 sm:mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 rounded-2xl sm:rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
            <Card className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-[1.02]">
              <CardHeader className="text-center pb-6 sm:pb-8 px-4 sm:px-8">
                <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  <CardTitle className="text-2xl sm:text-3xl font-bold">Tell us what you need</CardTitle>
                </div>
                <CardDescription className="text-slate-300 text-base sm:text-lg">
                  We'll find the best plans for you, plus some smart deals!
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-8 pb-6 sm:pb-8">
                <RechargeForm onSubmit={handleFormSubmit} isLoading={isLoading} />
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-12 sm:space-y-16">
            {isLoading && (
              <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
                <PlanSkeleton />
                <PlanSkeleton />
              </div>
            )}

            {valueForMoneyPlans && valueForMoneyPlans.length > 0 && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-3 sm:mb-4">
                      <BrainCircuit className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3 animate-pulse" />
                      <h2 className="text-2xl sm:text-3xl font-bold">Smart Suggestions for Long-Term Value</h2>
                    </div>
                    <p className="text-slate-300 text-base sm:text-lg">These plans could save you money over time with intelligent analysis.</p>
                  </div>
                  <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
                    {valueForMoneyPlans.map((plan, index) => (
                      <PlanCard key={`value-${index}`} plan={plan} isFeatured={true} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {exactMatchPlans && exactMatchPlans.length > 0 && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3 sm:mb-4">
                      <Star className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3" />
                      <h2 className="text-2xl sm:text-3xl font-bold">Your Perfect Match</h2>
                    </div>
                    <p className="text-slate-300 text-base sm:text-lg">Plans that exactly match your requirements.</p>
                  </div>
                  <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
                    {exactMatchPlans.map((plan, index) => (
                      <PlanCard key={`exact-${index}`} plan={plan} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {similarPlans && similarPlans.length > 0 && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                  <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 sm:mb-4">
                      <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3" />
                      <h2 className="text-2xl sm:text-3xl font-bold">Similar Plans You Might Like</h2>
                    </div>
                    <p className="text-slate-300 text-base sm:text-lg">Alternative options with similar data benefits.</p>
                  </div>
                  <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
                    {similarPlans.map((plan, index) => (
                      <PlanCard key={`similar-${index}`} plan={plan} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {hasNoResults && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-gray-600/20 rounded-2xl sm:rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center">
                  <div className="inline-flex items-center justify-center bg-slate-400 rounded-full p-4 sm:p-6 mb-4 sm:mb-6">
                    <WifiOff className="h-12 w-12 sm:h-16 sm:w-16 text-slate-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">No Plans Found</h3>
                  <p className="text-slate-300 text-base sm:text-lg max-w-md mx-auto">
                    We couldn't find any plans matching your criteria. Try adjusting your preferences or data requirements.
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Debug Section - Hidden by default, can be toggled */}
        {rawOutput && (
          <Card className="mt-12 sm:mt-16 max-w-5xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Debug Output</CardTitle>
              <CardDescription className="text-slate-300">Raw data returned from the backend logic.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 sm:p-6 bg-slate-900/50 rounded-xl text-xs overflow-auto text-slate-300 border border-slate-700">
                {JSON.stringify(rawOutput, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
