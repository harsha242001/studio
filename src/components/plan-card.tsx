'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, CalendarDays, Gift, IndianRupee, ArrowRight, Star, TrendingUp, Zap, Crown, Sparkles } from 'lucide-react';
import type { Plan } from '@/ai/schemas';

interface PlanCardProps {
  plan: Plan & { reasoning?: string };
  isFeatured?: boolean;
}

export function PlanCard({ plan, isFeatured = false }: PlanCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const highlightReasoning = (text: string) => {
    if (!text) return text;
    
    // Highlight savings and key numbers
    return text
      .replace(/(₹\d+)/g, '<span class="text-green-400 font-bold">$1</span>')
      .replace(/(\d+GB)/g, '<span class="text-blue-400 font-semibold">$1</span>')
      .replace(/(\d+ days?)/g, '<span class="text-purple-400 font-semibold">$1</span>')
      .replace(/(save|savings|cheaper)/gi, '<span class="text-emerald-400 font-semibold">$1</span>');
  };

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'jio':
        return 'from-red-500 to-red-600';
      case 'airtel':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getDataColor = (data: number) => {
    if (data <= 1) return 'from-slate-400 to-slate-500';
    if (data <= 2) return 'from-blue-400 to-blue-500';
    return 'from-purple-400 to-purple-500';
  };

  const getValidityColor = (validity: number) => {
    if (validity <= 28) return 'from-green-400 to-green-500';
    if (validity <= 84) return 'from-yellow-400 to-yellow-500';
    return 'from-orange-400 to-orange-500';
  };

  const getValueScore = () => {
    const dailyCost = plan.price / plan.validity;
    const dataValue = plan.dailyData / dailyCost;
    return Math.round(dataValue * 100);
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Glow */}
      <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl transition-all duration-500 ${
        isHovered 
          ? 'bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 blur-2xl scale-110' 
          : 'bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 blur-xl scale-100'
      }`}></div>

      {/* Main Card */}
      <Card className={`relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-purple-500/25 overflow-hidden ${
        isHovered ? 'scale-105' : 'scale-100'
      } ${isFeatured ? 'ring-2 ring-yellow-400/50' : ''}`}>
        
        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-sm"></div>
              <Badge className="relative bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold px-2 py-1 sm:px-3 sm:py-1 border-0 text-xs sm:text-sm">
                <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                <span className="hidden sm:inline">BEST VALUE</span>
                <span className="sm:hidden">BEST</span>
              </Badge>
            </div>
          </div>
        )}

        {/* Card Header */}
        <CardHeader className="pb-3 sm:pb-4 relative px-4 sm:px-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${getProviderColor(plan.provider)} flex items-center justify-center shadow-lg`}>
                <span className="text-white font-bold text-base sm:text-lg">
                  {plan.provider === 'Jio' ? '🔴' : '🔵'}
                </span>
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold text-white mb-1">{plan.planName}</CardTitle>
                <CardDescription className="text-slate-300 text-sm">{plan.provider}</CardDescription>
              </div>
            </div>
            
            {/* Value Score */}
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-xs sm:text-sm">Value</span>
              </div>
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-lg">{getValueScore()}</span>
              </div>
            </div>
          </div>

          {/* Price Display */}
          <div className="flex items-baseline justify-center gap-2">
            <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
            <span className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              {plan.price}
            </span>
            <div className="text-right">
              <div className="text-slate-300 text-xs sm:text-sm">for</div>
              <div className="text-white font-semibold text-sm sm:text-base">{plan.validity} days</div>
            </div>
          </div>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Data & Validity Info */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="group/item relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${getDataColor(plan.dailyData)} rounded-xl sm:rounded-2xl opacity-20 group-hover/item:opacity-30 transition-opacity duration-300`}></div>
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                <Wifi className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-blue-400" />
                <div className="text-white font-bold text-base sm:text-lg">{plan.dailyData} GB</div>
                <div className="text-slate-300 text-xs sm:text-sm">per day</div>
                <div className="text-slate-400 text-xs">({plan.totalData} GB total)</div>
              </div>
            </div>

            <div className="group/item relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${getValidityColor(plan.validity)} rounded-xl sm:rounded-2xl opacity-20 group-hover/item:opacity-30 transition-opacity duration-300`}></div>
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-green-400" />
                <div className="text-white font-bold text-base sm:text-lg">{plan.validity}</div>
                <div className="text-slate-300 text-xs sm:text-sm">days</div>
                <div className="text-slate-400 text-xs">validity</div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          {plan.otherBenefits && (
            <div className="group/item relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl sm:rounded-2xl opacity-20 group-hover/item:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400 flex-shrink-0 mt-1" />
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{plan.otherBenefits}</p>
                </div>
              </div>
            </div>
          )}

          {/* Value for Money Reasoning */}
          {plan.reasoning && (
            <div className="group/item relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl sm:rounded-2xl opacity-20 group-hover/item:opacity-30 transition-opacity duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 flex-shrink-0 mt-1" />
                  <div className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                    <div className="font-semibold text-emerald-400 mb-1">Why This Plan?</div>
                    <div 
                      className="text-slate-300"
                      dangerouslySetInnerHTML={{ __html: highlightReasoning(plan.reasoning) }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Details Toggle */}
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="space-y-3 pt-3 sm:pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="text-slate-400">
                  <span className="font-semibold">Daily Cost:</span>
                  <div className="text-white font-bold">₹{(plan.price / plan.validity).toFixed(2)}</div>
                </div>
                <div className="text-slate-400">
                  <span className="font-semibold">Data per ₹:</span>
                  <div className="text-white font-bold">{(plan.dailyData / (plan.price / plan.validity)).toFixed(3)} GB</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Card Footer */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-baseline">
            <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{plan.price}</span>
            <span className="text-slate-400 ml-2 text-sm">/ {plan.validity}d</span>
          </div>
          
          <Button
            asChild
            className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            size="lg"
          >
            <a href={plan.rechargeLink || '#'} target="_blank" rel="noopener noreferrer">
              <Zap className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Recharge Now</span>
              <span className="sm:hidden">Recharge</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
