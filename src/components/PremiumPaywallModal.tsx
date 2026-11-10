import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Award,
  Zap,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Lock,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { PricingConfig, UserDiscount, CouponCode } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (info?: { name: string; email: string }) => void;
  isDark?: boolean;
  freeCount: number;
  pricingConfig?: PricingConfig;
  userDiscounts?: UserDiscount[];
  coupons?: CouponCode[];
  initialEmail?: string;
  userId?: string;
  hasActivePass?: boolean;
  onRefreshPassStatus?: () => Promise<void> | void;
}

// 1. Dynamically load the Razorpay checkout script (https://checkout.razorpay.com/v1/checkout.js)
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const PremiumPaywallModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onUpgrade,
  isDark,
  freeCount,
  pricingConfig = {
    monthlyRegularPrice: 999,
    monthlyOfferPrice: 350,
    sixMonthRegularPrice: 2999,
    sixMonthOfferPrice: 1499,
    discountPercent: 65,
    currencySymbol: 'Rs.',
  },
  userDiscounts = [],
  coupons = [],
  initialEmail = 'sarathyk2009@gmail.com',
  userId,
  hasActivePass = false,
  onRefreshPassStatus,
}) => {
  const [name, setName] = useState('Sarathy K');
  const [email, setEmail] = useState(initialEmail);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'six_month'>('monthly');

  // Coupon code redemption state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);
  const [couponStatus, setCouponStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Payment states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);
  const [lastPaymentId, setLastPaymentId] = useState<string | null>(null);

  // Preload Razorpay checkout script dynamically
  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
      setPaymentError(null);
      setPaymentSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const curr = pricingConfig.currencySymbol || 'Rs.';

  // Check if candidate's email has a customized direct discount assigned by Admin
  const matchedDiscount = userDiscounts.find(
    (d) => d.email.toLowerCase() === email.trim().toLowerCase()
  );

  // Compute pricing for Monthly & Six-Month plans
  const baseMonthlyRegular = pricingConfig.monthlyRegularPrice;
  const baseMonthlyOffer = pricingConfig.monthlyOfferPrice;
  const baseSixMonthRegular = pricingConfig.sixMonthRegularPrice;
  const baseSixMonthOffer = pricingConfig.sixMonthOfferPrice;

  // Calculate price with candidate email discount
  let intermediateMonthly = baseMonthlyOffer;
  let intermediateSixMonth = baseSixMonthOffer;
  let emailDiscountLabel = '';

  if (matchedDiscount) {
    if (matchedDiscount.discountType === 'flat') {
      intermediateMonthly = Math.max(1, baseMonthlyOffer - matchedDiscount.discountValue);
      intermediateSixMonth = Math.max(1, baseSixMonthOffer - matchedDiscount.discountValue);
      emailDiscountLabel = `Rs. ${matchedDiscount.discountValue} OFF`;
    } else if (matchedDiscount.discountType === 'percentage' || matchedDiscount.discountPercent) {
      const pct = matchedDiscount.discountValue || matchedDiscount.discountPercent || 50;
      intermediateMonthly = Math.round(baseMonthlyRegular * (1 - pct / 100));
      intermediateSixMonth = Math.round(baseSixMonthRegular * (1 - pct / 100));
      emailDiscountLabel = `${pct}% OFF`;
    } else if (matchedDiscount.monthlyPrice && matchedDiscount.sixMonthPrice) {
      intermediateMonthly = matchedDiscount.monthlyPrice;
      intermediateSixMonth = matchedDiscount.sixMonthPrice;
      emailDiscountLabel = `${matchedDiscount.discountPercent || 50}% OFF`;
    }
  }

  // Calculate price with coupon code if applied
  let finalMonthly = intermediateMonthly;
  let finalSixMonth = intermediateSixMonth;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      finalMonthly = Math.max(1, Math.round(intermediateMonthly * (1 - appliedCoupon.discountValue / 100)));
      finalSixMonth = Math.max(
        1,
        Math.round(intermediateSixMonth * (1 - appliedCoupon.discountValue / 100))
      );
    } else {
      finalMonthly = Math.max(1, intermediateMonthly - appliedCoupon.discountValue);
      finalSixMonth = Math.max(1, intermediateSixMonth - appliedCoupon.discountValue);
    }
  }

  // Handle Coupon Application
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const query = couponInput.trim().toUpperCase();
    if (!query) {
      setCouponStatus({ type: 'error', message: 'Please enter a coupon code.' });
      return;
    }

    const found = coupons.find((c) => c.code.toUpperCase() === query);
    if (!found) {
      setCouponStatus({ type: 'error', message: `Coupon code "${query}" was not found.` });
      setAppliedCoupon(null);
      return;
    }

    if (!found.isActive) {
      setCouponStatus({ type: 'error', message: `Coupon code "${query}" is currently inactive.` });
      setAppliedCoupon(null);
      return;
    }

    // Check expiration
    if (found.expirationDate && new Date(found.expirationDate) < new Date()) {
      setCouponStatus({ type: 'error', message: `Coupon code "${query}" expired on ${found.expirationDate}.` });
      setAppliedCoupon(null);
      return;
    }

    // Check usage limit
    if (found.usageLimit && found.usageCount >= found.usageLimit) {
      setCouponStatus({ type: 'error', message: `Coupon code "${query}" has reached its maximum redemptions.` });
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(found);
    setCouponStatus({
      type: 'success',
      message: `Coupon "${found.code}" applied! ${
        found.discountType === 'percentage' ? `${found.discountValue}% OFF` : `Rs. ${found.discountValue} OFF`
      }`,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponStatus(null);
  };

  const activeFinalPrice = selectedPlan === 'monthly' ? finalMonthly : finalSixMonth;
  const activeRegularPrice = selectedPlan === 'monthly' ? baseMonthlyRegular : baseSixMonthRegular;
  const totalSavings = activeRegularPrice - activeFinalPrice;

  // 2. Primary Payment Handler: Connect to backend Razorpay endpoints
  const handleProceedToPay = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPaymentError(null);
    setPaymentSuccessMessage(null);
    setIsProcessingPayment(true);

    try {
      const effectiveUserId = userId || email.trim() || 'candidate_user';
      const planIdToSend = selectedPlan === 'monthly' ? 'monthly_sprint' : selectedPlan;
      const amountToSend = selectedPlan === 'monthly' ? (activeFinalPrice || 350) : (activeFinalPrice || 1499);

      // Step 1: Fetch order details from '/api/payment/create-order' AND the key from '/api/payment/config'
      const [orderRes, configRes] = await Promise.all([
        fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: planIdToSend,
            amount: amountToSend,
            userId: effectiveUserId,
          }),
        }),
        fetch('/api/payment/config'),
      ]);

      if (!orderRes.ok) {
        const errJson = await orderRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to create payment order. Please try again.');
      }

      const orderData = await orderRes.json();
      const configData = await configRes.json().catch(() => ({}));
      const keyId = configData?.keyId || '';

      // Step 2: Verify that keyId exists and starts with "rzp_". If missing/empty/invalid, show alert and DO NOT initialize window.Razorpay
      if (!keyId || typeof keyId !== 'string' || !keyId.startsWith('rzp_') || keyId.includes('placeholder')) {
        console.warn('Razorpay Key ID missing or placeholder on server:', keyId);
        setPaymentError('Payment gateway credentials missing. Use the 1-Click Demo Unlock button for testing.');
        throw new Error('Razorpay Key ID is not configured on the server.');
      }

      // Step 3: Dynamically ensure Razorpay checkout script is loaded
      await loadRazorpayScript();

      if (!(window as any).Razorpay) {
        throw new Error('Razorpay checkout script could not be loaded from network.');
      }

      const orderId = orderData.orderId;

      // Verification callback executed after successful payment modal interaction
      const verifyPaymentCallback = async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          setIsProcessingPayment(true);
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: effectiveUserId,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setLastPaymentId(response.razorpay_payment_id);
            setPaymentSuccessMessage(
              `Payment successful! Your FinHornet CMA Part 1 Active Pass is now unlocked and verified.`
            );
            if (onRefreshPassStatus) {
              await onRefreshPassStatus();
            }
            onUpgrade({ name, email });
          } else {
            setPaymentError(verifyData.error || 'Payment signature verification failed.');
          }
        } catch (verifyErr: any) {
          setPaymentError(verifyErr?.message || 'Error communicating with payment verification server.');
        } finally {
          setIsProcessingPayment(false);
        }
      };

      // Step 4: Instantiate 'new window.Razorpay(options)' using that keyId and returned orderId
      // Explicitly enable UPI and QR Code display blocks
      const options: any = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'FinHornet',
        description: selectedPlan === 'monthly' ? 'CMA Part 1 Sprint Pass' : 'CMA Part 1 Complete Pass',
        image: './assets/aistudio/WhatsApp_Image_2026-10-26_at_1.37.51_AM_bdac2704.jpeg',
        order_id: orderId,
        theme: {
          color: '#F59E0B',
        },
        prefill: {
          name: name || 'CMA Candidate',
          email: email || 'candidate@example.com',
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI or QR',
                instruments: [
                  {
                    method: 'upi',
                  },
                ],
              },
            },
            sequence: ['block.upi'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        upi: {
          flow: 'intent',
        },
        handler: function (response: any) {
          verifyPaymentCallback(response);
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      // Step 5: Attach an 'on' failure listener
      rzp.on('payment.failed', function (response: any) {
        console.warn('Razorpay payment failed:', response?.error);
        const desc = response?.error?.description || 'Payment was declined or cancelled.';
        setPaymentError(`Payment Failed: ${desc}`);
        setIsProcessingPayment(false);
      });

      // Step 6: Open the checkout modal
      rzp.open();
    } catch (err: any) {
      console.error('Payment checkout exception:', err);
      if (!paymentError) {
        setPaymentError(
          err.message?.includes('Razorpay Key ID is not configured')
            ? 'Payment gateway credentials missing. Use the 1-Click Demo Unlock button for testing.'
            : (err.message || 'Payment initialization failed. Please verify Razorpay API keys or test using 1-Click Demo Unlock.')
        );
      }
    } finally {
      // Ensure the button state always reverts from "Connecting to Razorpay..." back to "Proceed to Pay"
      setIsProcessingPayment(false);
    }
  };

  // 4. 1-Click Demo Unlock: Bypasses Razorpay entirely, instantly unlocks pass in state/Firestore, and closes modal
  const handleDemoUnlock = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);
    try {
      if (onRefreshPassStatus) {
        await onRefreshPassStatus();
      }
      onUpgrade({ name: name || 'Demo Evaluator', email: email || 'candidate@example.com' });
      onClose();
    } catch (e: any) {
      onUpgrade({ name: name || 'Demo Evaluator', email: email || 'candidate@example.com' });
      onClose();
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-label="Monthly Pass & Billing - FinHornet"
    >
      <div
        className="w-full max-w-2xl rounded-3xl shadow-2xl border flex flex-col overflow-hidden max-h-[95vh]"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        {/* Top Header Banner with Gradient */}
        <div className="relative p-6 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white select-none">
          <button
            onClick={onClose}
            aria-label="Close Upgrade Modal"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-bold mb-3 uppercase tracking-wider shadow-sm border border-amber-400/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Monthly Pass & Billing • 50% Launch Concession</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">
            Ace US CMA Part 1 with FinHornet
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm max-w-xl font-medium">
            Simulate authentic Prometric CBT exams, conquer case exhibits, and master every concept with FinHornet AI.
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Pass Confirmation State */}
          {hasActivePass && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-xs uppercase tracking-wider block">
                  Active Pass Already Enabled
                </span>
                <span className="text-xs">
                  Your candidate profile currently holds an active pass. Unlimited Prometric timed mocks and distractor clinics are active.
                </span>
              </div>
            </div>
          )}

          {/* Payment Success Confirmation Message */}
          {paymentSuccessMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-start gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-xs block text-emerald-900 dark:text-emerald-100">
                  Payment Verified Successfully!
                </span>
                <p className="text-xs mt-0.5 leading-relaxed">{paymentSuccessMessage}</p>
                <div className="mt-2.5 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    Active Pass Active
                  </span>
                  <button
                    onClick={onClose}
                    className="text-xs font-bold underline hover:no-underline text-emerald-700 dark:text-emerald-300"
                  >
                    Done & Return to Test Dashboard →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Error Alert */}
          {paymentError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: ShieldCheck,
                title: 'US CMA Part 1 Question Bank',
                desc: 'External Reporting, Planning, Budgeting, Cost Mgmt & Analytics.',
              },
              {
                icon: Clock,
                title: 'Authentic 100-MCQ Prometric Timer',
                desc: '3-hour official countdown, question flagging, strike-through & calculator.',
              },
              {
                icon: Award,
                title: '0–500 Scaled Score Engine',
                desc: 'Track trajectory against the 360 passing line with pace analysis.',
              },
              {
                icon: Zap,
                title: 'Step-by-Step AI Solutions',
                desc: 'Full mathematical steps, formulas, and distractor breakdowns.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                  <f.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                    {f.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Plan Selection Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Your CMA Access Pass:
            </label>

            {matchedDiscount && (
              <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2 animate-in fade-in">
                <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Personalized Waiver Applied:</strong> Admin granted an exclusive{' '}
                  <strong>{emailDiscountLabel}</strong> concession for <strong>{matchedDiscount.email}</strong>
                  {matchedDiscount.note ? ` ("${matchedDiscount.note}")` : ''}!
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                  selectedPlan === 'monthly'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs ring-1 ring-amber-400'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                      Monthly Sprint Pass
                    </span>
                    <span className="text-[10px] text-slate-400">Cancel anytime</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through mr-1 font-mono">
                      {curr} {baseMonthlyRegular}
                    </span>
                    <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                      {curr} {finalMonthly}{' '}
                      <span className="text-[10px] font-normal text-slate-500">/mo</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded inline-block">
                  Save {curr} {baseMonthlyRegular - finalMonthly} every month
                </div>
              </div>

              {/* Complete Pass for 6 Months */}
              <div
                onClick={() => setSelectedPlan('six_month')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                  selectedPlan === 'six_month'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs ring-1 ring-amber-400'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase shadow-xs">
                  Best Value
                </span>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                      6-Month Complete Pass
                    </span>
                    <span className="text-[10px] text-slate-400">Full 6 Months Access</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 line-through mr-1 font-mono">
                      {curr} {baseSixMonthRegular}
                    </span>
                    <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {curr} {finalSixMonth}{' '}
                      <span className="text-[10px] font-normal text-slate-500">/ 6 mos</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded inline-block">
                  Covers entire testing window • Save {curr} {baseSixMonthRegular - finalSixMonth}
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Code Redemption Form */}
          <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>Have a Promo or Coupon Code?</span>
              </span>
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Remove code
                </button>
              )}
            </div>

            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo code (e.g. SAVE20)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                disabled={Boolean(appliedCoupon)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={Boolean(appliedCoupon)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 disabled:opacity-50 transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                Apply Code
              </button>
            </form>

            {couponStatus && (
              <div
                className={`text-[11px] font-semibold flex items-center gap-1.5 pt-0.5 ${
                  couponStatus.type === 'success'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {couponStatus.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{couponStatus.message}</span>
              </div>
            )}
          </div>

          {/* Candidate Details & Razorpay Checkout Action */}
          <form onSubmit={handleProceedToPay} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarathy K"
                  className="w-full px-3 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarathy@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-400 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Primary Payment Button: Proceed to Pay / Buy Pass */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={isProcessingPayment}
                data-testid="proceed-to-pay-btn"
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                aria-label="Proceed to Pay and Buy Pass"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
                    <span>
                      Proceed to Pay • Buy Pass ({curr} {activeFinalPrice})
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoUnlock}
                className="py-3 px-4 rounded-xl font-medium text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                title="Instant 1-click test checkout and verify"
              >
                1-Click Demo Unlock
              </button>
            </div>
          </form>

          {/* Payment Badges (India specific) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Razorpay Secured 256-Bit SSL:</span>
            </span>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                UPI / GPay / PhonePe
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                RuPay & Visa
              </span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                NetBanking
              </span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% Pass Guarantee • 6-Month Coverage • Prometric CBT Compliant</span>
        </div>
      </div>
    </div>
  );
};
