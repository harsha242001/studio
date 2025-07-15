'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PlanSkeleton() {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <Skeleton className="h-5 w-5 mr-3 rounded-full" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <div className="flex items-center">
          <Skeleton className="h-5 w-5 mr-3 rounded-full" />
          <Skeleton className="h-5 w-2/5" />
        </div>
      </CardContent>
      <CardFooter className="bg-secondary/50 p-4 flex items-center justify-between mt-auto">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-1/3" />
      </CardFooter>
    </Card>
  );
}
