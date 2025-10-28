'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PlanSkeleton() {
  return (
    <div className="group relative">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 blur-xl"></div>
      
      <Card className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <CardHeader className="pb-3 sm:pb-4 relative px-4 sm:px-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/20" />
              <div>
                <Skeleton className="h-5 w-28 sm:w-32 bg-white/20 mb-2" />
                <Skeleton className="h-3 w-16 sm:w-20 bg-white/20" />
              </div>
            </div>
            
            <div className="text-right">
              <Skeleton className="h-3 w-16 sm:w-20 bg-white/20 mb-1" />
              <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20" />
            </div>
          </div>

          {/* Price Display */}
          <div className="flex items-baseline justify-center gap-2">
            <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/20" />
            <Skeleton className="h-12 w-20 sm:h-16 sm:w-24 bg-white/20" />
            <div className="text-right">
              <Skeleton className="h-3 w-10 sm:w-12 bg-white/20 mb-1" />
              <Skeleton className="h-4 w-14 sm:w-16 bg-white/20" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Data & Validity Info */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 bg-white/20" />
              <Skeleton className="h-5 w-14 sm:w-16 bg-white/20 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 sm:w-20 bg-white/20 mx-auto mb-1" />
              <Skeleton className="h-3 w-20 sm:w-24 bg-white/20 mx-auto" />
            </div>

            <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 bg-white/20" />
              <Skeleton className="h-5 w-14 sm:w-16 bg-white/20 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 sm:w-20 bg-white/20 mx-auto mb-1" />
              <Skeleton className="h-3 w-20 sm:w-24 bg-white/20 mx-auto" />
            </div>
          </div>

          {/* Benefits */}
          <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <Skeleton className="h-4 w-4 sm:h-5 sm:w-5 bg-white/20 flex-shrink-0 mt-1" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-full bg-white/20" />
                <Skeleton className="h-3 w-3/4 bg-white/20" />
              </div>
            </div>
          </div>

          {/* Interactive Details Toggle */}
          <div className="flex items-center justify-center">
            <Skeleton className="h-7 w-20 sm:w-24 bg-white/20 rounded-lg" />
          </div>
        </CardContent>

        {/* Card Footer */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-baseline">
            <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 bg-white/20" />
            <Skeleton className="h-6 w-16 sm:w-20 bg-white/20 ml-2" />
            <Skeleton className="h-3 w-12 sm:w-16 bg-white/20 ml-2" />
          </div>
          
          <Skeleton className="h-10 w-full sm:w-32 bg-white/20 rounded-xl" />
        </div>
      </Card>
    </div>
  );
}
