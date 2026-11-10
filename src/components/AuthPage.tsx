import React, { useState } from 'react';
import { Sparkles, Shield, ArrowLeft, Mail, Lock, User, CheckCircle2, Award, BookOpen } from 'lucide-react';
import { FinHornetLogo } from './FinHornetLogo';
import { PricingConfig, UserDiscount, UserRole } from '../types';
import { signInWithGoogle, ADMIN_EMAIL } from '../services/firebase';

interface Props {
  isDark: boolean;
  offerClaimed?: boolean;
  pricingConfig: PricingConfig;
  customDiscount?: UserDiscount | null;
  onLoginSuccess: (userData: {
    name: string;
    email: string;
    role?: UserRole;
    isPremium?: boolean;
  }) => void;
  onContinueAsGuest: () => void;
}

export const AuthPage: React.FC<Props> = ({
  isDark,
  offerClaimed = false,
  pricingConfig,
  customDiscount,
  onLoginSuccess,
  onContinueAsGuest,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const regularPrice = pricingConfig.monthlyRegularPrice;
  const offerPrice = customDiscount ? customDiscount.monthlyPrice : pricingConfig.monthlyOfferPrice;
  const discountPercent = customDiscount ? customDiscount.discountPercent : pricingConfig.discountPercent;
  const currency = pricingConfig.currencySymbol || 'Rs.';

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');
    try {
      const googleUser = await signInWithGoogle();
      if (googleUser && googleUser.email) {
        const isAdmin = googleUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        onLoginSuccess({
          name: googleUser.displayName || googleUser.email.split('@')[0],
          email: googleUser.email,
          role: isAdmin ? 'admin' : 'user',
          isPremium: isAdmin || offerClaimed,
        });
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      // Fallback if popup was closed or offline
      if (err?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err?.message || 'Google sign-in could not be completed.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    const userName = name.trim() || email.split('@')[0];
    onLoginSuccess({
      name: userName,
      email: email.trim(),
      role: 'user',
      isPremium: offerClaimed,
    });
  };

  return (
    <div
      className={`min-h-[85vh] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Back / Guest Link */}
        <div className="flex items-center justify-between">
          <button
            onClick={onContinueAsGuest}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue as Guest (5 Free Questions)</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <FinHornetLogo size="lg" showSubtitle={true} />
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-2">
            {authMode === 'signin' ? 'Welcome Back to FinHornet' : 'Create Your FinHornet Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {authMode === 'signin'
              ? 'Access US CMA Part 1 CBT mocks, case questions, and distractor analyses'
              : 'Start your journey to US CMA certification with realistic Prometric simulation'}
          </p>
        </div>

        {/* Offer Unlocked Banner if redirected from 5 free questions */}
        {offerClaimed && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-sm animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    50% Offer Unlocked & Reserved
                  </span>
                  <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                    {discountPercent}% OFF
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Congratulations on completing 5 free practice questions! Sign in or register below to lock in{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-black">
                    {currency} {offerPrice}/month
                  </strong>{' '}
                  (normally {currency} {regularPrice}).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Auth Card */}
        <div
          className="p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          {/* Quick Sign-in with Google */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-3 px-4 rounded-2xl border font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs"
              style={{
                borderColor: isDark ? '#334155' : '#cbd5e1',
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
              }}
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="mt-5 relative flex items-center justify-center">
              <div className="border-t w-full border-slate-200 dark:border-slate-800" />
              <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 absolute uppercase tracking-wider">
                Or with username / email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarathy K"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-transparent border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="candidate@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-transparent border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-transparent border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-sm text-blue-600"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset link sent to registered email.')}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
            >
              {authMode === 'signin' ? 'Sign In' : 'Create FinHornet Account'}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            {authMode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Create free account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('signin')}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Free guest trial note */}
        <div className="text-center">
          <button
            onClick={onContinueAsGuest}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline font-medium"
          >
            Take 5 free questions first without signing in →
          </button>
        </div>
      </div>
    </div>
  );
};
