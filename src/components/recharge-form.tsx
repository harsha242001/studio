'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Zap } from 'lucide-react';
import { SuggestRechargePlansInputSchema } from '@/ai/schemas';
import type { SuggestRechargePlansInput } from '@/ai/schemas';

export const rechargeFormSchema = SuggestRechargePlansInputSchema.extend({
  dailyDataUsageGB: z.coerce.number().min(0.1, { message: 'Please select a data amount.' }),
  validityDays: z.coerce.number().min(1, { message: 'Please select a validity period.' }),
  telecomProvider: z.string().min(1, { message: 'Please select a provider.' }),
});

export type RechargeFormValues = z.infer<typeof rechargeFormSchema>;

interface RechargeFormProps {
  onSubmit: (values: SuggestRechargePlansInput) => void;
  isLoading: boolean;
}

const dataOptions = ['1', '1.5', '2', '2.5', '3'];
const validityOptions = ['28', '56', '84', '365'];
const providerOptions = ['Airtel', 'Jio'];

export function RechargeForm({ onSubmit, isLoading }: RechargeFormProps) {
  const form = useForm<RechargeFormValues>({
    resolver: zodResolver(rechargeFormSchema),
    defaultValues: {
      telecomProvider: '',
      location: '',
      dailyDataUsageGB: 0,
      validityDays: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="telecomProvider"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Telecom Provider</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providerOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="validityDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Preferred Validity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select validity period" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {validityOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dailyDataUsageGB"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="font-semibold">How much data do you need per day?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={String(field.value)}
                  className="flex flex-wrap gap-4"
                >
                  {dataOptions.map((option) => (
                    <FormItem key={option} className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={option} />
                      </FormControl>
                      <FormLabel className="font-normal">{option} GB</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Delhi, Mumbai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Zap className="mr-2 h-4 w-4" />
          )}
          Find My Plan
        </Button>
      </form>
    </Form>
  );
}
