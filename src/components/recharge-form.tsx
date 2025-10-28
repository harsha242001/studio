'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Zap, Smartphone, Calendar, Wifi, MapPin, Sparkles } from 'lucide-react';
import { SuggestRechargePlansInputSchema } from '@/ai/schemas';
import type { SuggestRechargePlansInput } from '@/ai/schemas';
import { useState } from 'react';

export const rechargeFormSchema = SuggestRechargePlansInputSchema.extend({
  dailyDataUsageGB: z.string().min(1, { message: 'Please select a data amount.' }),
  validityDays: z.string().min(1, { message: 'Please select a validity period.' }),
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
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedData, setSelectedData] = useState('');
  const [selectedValidity, setSelectedValidity] = useState('');

  const form = useForm<RechargeFormValues>({
    resolver: zodResolver(rechargeFormSchema),
    defaultValues: {
      telecomProvider: '',
      location: '',
      dailyDataUsageGB: '0',
      validityDays: '0',
    },
  });

  const handleFormSubmit = (values: RechargeFormValues) => {
    onSubmit({
      ...values,
      dailyDataUsageGB: parseFloat(values.dailyDataUsageGB),
      validityDays: parseInt(values.validityDays, 10),
    });
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'jio':
        return '🔴';
      case 'airtel':
        return '🔵';
      default:
        return '📱';
    }
  };

  const getDataIcon = (data: string) => {
    const dataNum = parseFloat(data);
    if (dataNum <= 1) return '📱';
    if (dataNum <= 2) return '💻';
    return '🚀';
  };

  const getValidityIcon = (validity: string) => {
    const validityNum = parseInt(validity);
    if (validityNum <= 28) return '📅';
    if (validityNum <= 84) return '📆';
    return '📊';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 sm:space-y-10">
        {/* Provider Selection */}
        <FormField
          control={form.control}
          name="telecomProvider"
          render={({ field }) => (
            <FormItem className="space-y-3 sm:space-y-4">
              <FormLabel className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                Choose Your Telecom Provider
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {providerOptions.map((option) => (
                    <div
                      key={option}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        field.value === option ? 'scale-105' : 'hover:scale-102'
                      }`}
                      onClick={() => {
                        field.onChange(option);
                        setSelectedProvider(option);
                      }}
                    >
                      <div className={`absolute inset-0 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                        field.value === option 
                          ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 shadow-lg shadow-purple-500/25' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}></div>
                      <div className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                        field.value === option 
                          ? 'border-purple-400/50 bg-white/10' 
                          : 'border-white/20 hover:border-white/30'
                      } text-center backdrop-blur-sm`}>
                        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{getProviderIcon(option)}</div>
                        <div className={`font-semibold text-base sm:text-lg transition-colors ${
                          field.value === option ? 'text-white' : 'text-slate-300'
                        }`}>
                          {option}
                        </div>
                        {field.value === option && (
                          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Data Usage Selection */}
        <FormField
          control={form.control}
          name="dailyDataUsageGB"
          render={({ field }) => (
            <FormItem className="space-y-3 sm:space-y-4">
              <FormLabel className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Wifi className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400" />
                Daily Data Requirements
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {dataOptions.map((option) => (
                    <div
                      key={option}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        field.value === option ? 'scale-110' : 'hover:scale-105'
                      }`}
                      onClick={() => {
                        field.onChange(option);
                        setSelectedData(option);
                      }}
                    >
                      <div className={`absolute inset-0 rounded-lg sm:rounded-xl transition-all duration-300 ${
                        field.value === option 
                          ? 'bg-gradient-to-r from-pink-600/30 to-purple-600/30 shadow-lg shadow-pink-500/25' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}></div>
                      <div className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                        field.value === option 
                          ? 'border-pink-400/50 bg-white/10' 
                          : 'border-white/20 hover:border-white/30'
                      } text-center backdrop-blur-sm`}>
                        <div className="text-lg sm:text-2xl mb-1 sm:mb-2">{getDataIcon(option)}</div>
                        <div className={`font-bold text-sm sm:text-lg transition-colors ${
                          field.value === option ? 'text-white' : 'text-slate-300'
                        }`}>
                          {option} GB
                        </div>
                        <div className={`text-xs transition-colors ${
                          field.value === option ? 'text-pink-200' : 'text-slate-400'
                        }`}>
                          per day
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Validity Selection */}
        <FormField
          control={form.control}
          name="validityDays"
          render={({ field }) => (
            <FormItem className="space-y-3 sm:space-y-4">
              <FormLabel className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                Plan Duration
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {validityOptions.map((option) => (
                    <div
                      key={option}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        field.value === option ? 'scale-105' : 'hover:scale-102'
                      }`}
                      onClick={() => {
                        field.onChange(option);
                        setSelectedValidity(option);
                      }}
                    >
                      <div className={`absolute inset-0 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                        field.value === option 
                          ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 shadow-lg shadow-blue-500/25' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}></div>
                      <div className={`relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                        field.value === option 
                          ? 'border-blue-400/50 bg-white/10' 
                          : 'border-white/20 hover:border-white/30'
                      } text-center backdrop-blur-sm`}>
                        <div className="text-lg sm:text-2xl mb-1 sm:mb-2">{getValidityIcon(option)}</div>
                        <div className={`font-bold text-base sm:text-lg transition-colors ${
                          field.value === option ? 'text-white' : 'text-slate-300'
                        }`}>
                          {option}
                        </div>
                        <div className={`text-xs transition-colors ${
                          field.value === option ? 'text-blue-200' : 'text-slate-400'
                        }`}>
                          {option === '365' ? 'Year' : 'Days'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Location Input */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="space-y-2 sm:space-y-3">
              <FormLabel className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                Location (Optional)
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-lg sm:rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <Input 
                    placeholder="e.g. Delhi, Mumbai, Bangalore" 
                    {...field} 
                    className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg sm:rounded-xl text-white placeholder:text-slate-400 focus:border-emerald-400/50 focus:ring-emerald-400/20 transition-all duration-300 h-11 sm:h-12 text-base sm:text-lg"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="pt-4 sm:pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="relative w-full h-12 sm:h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            size="lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl sm:rounded-2xl blur-xl opacity-50"></div>
            <div className="relative flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Zap className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="hidden sm:inline">
                {isLoading ? 'Finding Your Perfect Plan...' : 'Find My Perfect Plan'}
              </span>
              <span className="sm:hidden">
                {isLoading ? 'Finding...' : 'Find Plan'}
              </span>
            </div>
          </Button>
        </div>

        {/* Form Progress Indicator */}
        <div className="pt-3 sm:pt-4">
          <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs sm:text-sm">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              selectedProvider ? 'bg-purple-400' : 'bg-slate-600'
            }`}></div>
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              selectedData ? 'bg-pink-400' : 'bg-slate-600'
            }`}></div>
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              selectedValidity ? 'bg-blue-400' : 'bg-slate-600'
            }`}></div>
          </div>
          <p className="text-center text-slate-400 text-xs mt-2 px-4">
            {selectedProvider && selectedData && selectedValidity 
              ? 'All set! Ready to find your perfect plan.' 
              : 'Complete the form to get personalized recommendations.'}
          </p>
        </div>
      </form>
    </Form>
  );
}
