import React from 'react';
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap, Award, Flame, X } from 'lucide-react';
import { PricingConfig, UserDiscount } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onClaimOffer: () => void;
  pricingConfig: PricingConfig;
  customDiscount?: UserDiscount | null;
  isDark?: boolean;
}

export const OfferUnlockedModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onClaimOffer,
  pricingConfig,
  customDiscount,
  isDark,
}) => {
  if (!isOpen) return null;

  const regularPrice = pricingConfig.monthlyRegularPrice;
  const offerPrice = customDiscount ? customDiscount.monthlyPrice : pricingConfig.monthlyOfferPrice;
  const discountPercent = customDiscount ? customDiscount.discountPercent : pricingConfig.discountPercent;
  const currency = pricingConfig.currencySymbol || 'Rs.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-label="50% Offer Unlocked Celebration"
    >
      <div
        className="w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden relative transition-all"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close offer modal"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Celebration Banner */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-slate-950 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/15 font-black text-xs uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Milestone Achieved: 5 Questions Completed</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            🎉 Offer Unlocked For You!
          </h2>
          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-900/90 max-w-sm mx-auto">
            You just crushed your 5 free practice questions. We have unlocked an exclusive{' '}
            <span className="font-extrabold underline">{discountPercent}% special discount</span> for you!
          </p>
        </div>

        {/* Pricing & Benefit Details */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Price Callout */}
          <div
            className="p-5 rounded-2xl border text-center relative overflow-hidden"
            style={{
              backgroundColor: isDark ? '#111827' : '#f8fafc',
              borderColor: isDark ? '#1f2937' : '#e2e8f0',
            }}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-teal-600 text-white text-[11px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              {discountPercent}% SAVINGS
            </div>

            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              FinHornet US CMA Part 1 Complete Pass
            </p>

            <div className="mt-2 flex items-baseline justify-center gap-2">
              <span className="text-slate-400 line-through text-lg">
                {currency} {regularPrice}
              </span>
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                {currency} {offerPrice}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">/ month</span>
            </div>

            {customDiscount && (
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                🌟 Custom VIP rate applied for {customDiscount.email}
              </p>
            )}
          </div>

          {/* Key Advantages */}
          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span><strong>Full Prometric CBT Simulator</strong> with 100-question timed mocks</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span><strong>"Why It's Wrong" Breakdown</strong> for every single distractor</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span><strong>Case-Based Questions & Exhibits</strong> (standard cost variance & GAAP cases)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center shrink-0">
                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span><strong>0–500 Scaled Score Predictor</strong> targeting official 360 passing line</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClaimOffer}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
            >
              <span>Claim {discountPercent}% Offer & Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors text-center"
            >
              Continue exploring as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
