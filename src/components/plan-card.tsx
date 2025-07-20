'use client';

import type { Plan } from '@/ai/schemas';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, CalendarDays, IndianRupee, Gift, ArrowRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// This type alias correctly handles the plan structure from all sources, including the AI output.
type PlanCardProps = {
  plan: Plan & { reasoning?: string };
  isFeatured?: boolean;
};

export function PlanCard({ plan, isFeatured = false }: PlanCardProps) {
  return (
    <Card className={cn("flex flex-col justify-between shadow-md hover:shadow-xl transition-shadow duration-300", isFeatured && "border-accent border-2 shadow-accent/20")}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{plan.planName}</CardTitle>
            <Badge variant={plan.provider === 'Jio' ? 'default' : 'secondary'}>{plan.provider}</Badge>
        </div>
        {plan.reasoning && (
          <CardDescription className="pt-2 text-sm text-accent-foreground/90 bg-accent/20 p-3 rounded-md border border-accent/30">
            <Star className="inline-block h-4 w-4 mr-2 mb-0.5" />
            {plan.reasoning}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <Wifi className="h-5 w-5 mr-3 text-primary" />
          <p>
            <span className="font-semibold">{plan.dailyData} GB/day</span>
            <span className="text-muted-foreground"> ({plan.totalData} GB total)</span>
          </p>
        </div>
        <div className="flex items-center">
          <CalendarDays className="h-5 w-5 mr-3 text-primary" />
          <p>
            <span className="font-semibold">{plan.validity} days</span>
            <span className="text-muted-foreground"> validity</span>
          </p>
        </div>
        {plan.otherBenefits && (
          <div className="flex items-start">
            <Gift className="h-5 w-5 mr-3 text-primary flex-shrink-0 mt-1" />
            <p className="text-muted-foreground">{plan.otherBenefits}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-secondary/50 p-4 flex items-center justify-between mt-auto">
        <div className="flex items-baseline">
          <IndianRupee className="h-6 w-6" />
          <span className="text-3xl font-extrabold tracking-tight">{plan.price}</span>
        </div>
        <Button
          asChild
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <a href={plan.rechargeLink || '#'} target="_blank" rel="noopener noreferrer">
            Recharge Now <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
