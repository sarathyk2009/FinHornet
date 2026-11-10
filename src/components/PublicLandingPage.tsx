import React from 'react';
import {
  Sparkles,
  Play,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  BookOpen,
  CheckCircle2,
  PhoneCall,
  Flame,
  FileSpreadsheet,
} from 'lucide-react';
import { PricingConfig, UserDiscount } from '../types';
import { FinHornetLogo } from './FinHornetLogo';

interface Props {
  isDark: boolean;
  pricingConfig: PricingConfig;
  customDiscount?: UserDiscount | null;
  onTryFreeQuestions: () => void;
  onEnrollNow: () => void;
  onGoToBlogs: () => void;
  onGoToAbout: () => void;
  onOpenTalkToUs: () => void;
}

export const PublicLandingPage: React.FC<Props> = ({
  isDark,
  pricingConfig,
  customDiscount,
  onTryFreeQuestions,
  onEnrollNow,
  onGoToBlogs,
  onGoToAbout,
  onOpenTalkToUs,
}) => {
  const curr = pricingConfig.currencySymbol || 'Rs.';
  const offerPrice = customDiscount ? customDiscount.monthlyPrice : pricingConfig.monthlyOfferPrice;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16 w-full box-border">
      {/* =========================================================================
          HERO SECTION: High-Converting, Clean & Responsive
         ========================================================================= */}
      {/* =========================================================================
          HERO SECTION: High-Converting, Clean & Responsive Split Layout
         ========================================================================= */}
      <section
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border shadow-sm p-6 sm:p-10 lg:p-12 transition-all w-full max-w-full box-border"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Headline, Value Propositions, CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Syllabus Pill Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>FinHornet CMA Prep Engine</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                US CMA Part 1 Practice
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prometric CBT Simulation</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              Master US CMA Part 1 with <span className="text-amber-500 dark:text-amber-400">FinHornet</span>
            </h1>

            {/* Subtitle / Value Propositions */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              The premier AI-driven exam simulator and practice engine built for CMA candidates. Master standard costing variance trees, inventory reconciliations, and internal control frameworks with authentic Prometric CBT timed conditions and instant step-by-step mathematical breakdowns.
            </p>

            {/* Primary Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onTryFreeQuestions}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-102 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Try Free Sample Questions</span>
              </button>

              <button
                onClick={onEnrollNow}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-102 cursor-pointer"
              >
                <span>Explore Passes ({curr} {offerPrice}/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Instant Guarantee Callout */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No credit card required for 5 free questions</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Instant 0–500 scaled score converter</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Detailed step-by-step formula derivations</span>
              </span>
            </div>
          </div>

          {/* Right Column: Workstation Photography with 80%+ Target Passing Rate Overlay Badge */}
          <div className="lg:col-span-5 relative w-full">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80"
                alt="Finance professionals and students collaborating on CMA examination prep"
                loading="lazy"
                className="w-full h-72 sm:h-84 lg:h-96 object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none" />

              {/* Floating Overlay Badge: 🎯 80%+ Target Passing Rate */}
              <div className="absolute top-4 right-4 z-10 px-3.5 py-1.5 rounded-xl bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border border-amber-500/40 text-amber-400 font-bold text-xs shadow-lg flex items-center gap-2">
                <span>🎯</span>
                <span className="tracking-wide">80%+ Target Passing Rate</span>
              </div>

              {/* Bottom Caption Pill */}
              <div className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 text-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-slate-100">Prometric CBT Engine</span>
                </div>
                <span className="text-amber-400 font-bold font-mono">108s / MCQ Pace</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CORE FEATURES OVERVIEW: 4 Clear, Production-Grade Cards with Contextual Thumbnails
         ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Engineered For CMA Certification
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Everything You Need to Clear Part 1 on Your First Attempt
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Designed to bridge the gap between textbook theory and authentic Prometric computer-based testing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Feature 1: Authentic Prometric CBT Simulator */}
          <div
            className="p-5 sm:p-6 rounded-3xl border shadow-sm space-y-3 transition-transform hover:-translate-y-1 flex flex-col justify-between"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div>
              <div className="relative overflow-hidden rounded-xl mb-4 group">
                <img
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80"
                  alt="Focused test taker sitting for Prometric examination"
                  loading="lazy"
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 p-2 rounded-lg bg-slate-900/80 backdrop-blur-md text-blue-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Prometric CBT Simulator
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                Experience the authentic Prometric test environment: 100-MCQ timed exam mode, standard 108s question countdown, scratchpad, flag review, and strike-through options.
              </p>
            </div>
          </div>

          {/* Feature 2: Deep Cost & Financial Analysis */}
          <div
            className="p-5 sm:p-6 rounded-3xl border shadow-sm space-y-3 transition-transform hover:-translate-y-1 flex flex-col justify-between"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div>
              <div className="relative overflow-hidden rounded-xl mb-4 group">
                <img
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80"
                  alt="Cost and financial analysis spreadsheets with variance charts"
                  loading="lazy"
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 p-2 rounded-lg bg-slate-900/80 backdrop-blur-md text-emerald-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Cost & Variance Drills
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                Targeted drills across Absorption vs. Variable costing, 4-variance overhead decompositions, joint-product allocations, and breakeven equations.
              </p>
            </div>
          </div>

          {/* Feature 3: AI Step-by-Step Question Breakdown */}
          <div
            className="p-5 sm:p-6 rounded-3xl border shadow-sm space-y-3 transition-transform hover:-translate-y-1 flex flex-col justify-between"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div>
              <div className="relative overflow-hidden rounded-xl mb-4 group">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"
                  alt="Interactive AI learning tutor explaining financial equations step-by-step"
                  loading="lazy"
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 p-2 rounded-lg bg-slate-900/80 backdrop-blur-md text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                AI Step-by-Step Solutions
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                Never get stuck on cryptic answer keys. Every question features full mathematical derivations, variable reconciliations, and distractor rationales powered by FinHornet Gemini AI.
              </p>
            </div>
          </div>

          {/* Feature 4: Scaled Score Readiness Tracking */}
          <div
            className="p-5 sm:p-6 rounded-3xl border shadow-sm space-y-3 transition-transform hover:-translate-y-1 flex flex-col justify-between"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div>
              <div className="relative overflow-hidden rounded-xl mb-4 group">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
                  alt="Analytics dashboard showing scaled score trajectory and domain mastery"
                  loading="lazy"
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 left-2.5 p-2 rounded-lg bg-slate-900/80 backdrop-blur-md text-purple-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                0–500 Scaled Score Gauge
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                Track your trajectory against the 360-mark CMA passing benchmark. Monitor pace efficiency, domain mastery, and historical simulation performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SYLLABUS ALIGNMENT & METHODOLOGY SECTION
         ========================================================================= */}
      <section
        className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border shadow-sm space-y-6"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-5 border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Methodology & Standards
            </h2>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Mapped to US CMA Part 1 Content Specification Outlines
            </h3>
          </div>
          <button
            onClick={onGoToBlogs}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5"
          >
            <span>Explore Free Study Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Domains Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center font-bold text-xs">
              <span className="text-slate-900 dark:text-slate-100">Domain A: External Financial Reporting</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">15%</span>
            </div>
            <p className="text-[11px] text-slate-500">Balance sheet valuation, revenue recognition, IFRS vs US GAAP reconciliations.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center font-bold text-xs">
              <span className="text-slate-900 dark:text-slate-100">Domain B: Planning, Budgeting & Forecasting</span>
              <span className="text-amber-600 dark:text-amber-400 font-mono">20%</span>
            </div>
            <p className="text-[11px] text-slate-500">Master budgeting, flexible budgeting, cash budgets, and pro-forma statements.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center font-bold text-xs">
              <span className="text-slate-900 dark:text-slate-100">Domain C: Cost Management</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">20%</span>
            </div>
            <p className="text-[11px] text-slate-500">Cost allocation, standard costing, 4-way overhead variance trees, ABC costing.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center font-bold text-xs">
              <span className="text-slate-900 dark:text-slate-100">Domain D: Performance Management</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono">20%</span>
            </div>
            <p className="text-[11px] text-slate-500">ROI, Residual Income (RI), transfer pricing, and responsibility center metrics.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center font-bold text-xs">
              <span className="text-slate-900 dark:text-slate-100">Domain E: Internal Controls</span>
              <span className="text-sky-600 dark:text-sky-400 font-mono">15%</span>
            </div>
            <p className="text-[11px] text-slate-500">COSO 2013 framework, segregation of duties, internal auditing, and fraud risk.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex justify-between items-center font-bold text-xs">
              <span className="text-slate-900 dark:text-slate-100">Domain F: Technology & Analytics</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono">10%</span>
            </div>
            <p className="text-[11px] text-slate-500">Data governance, business intelligence, ERP systems, and robotic automation.</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CALL TO ACTION FOOTER BANNER
         ========================================================================= */}
      <section
        className="rounded-3xl border shadow-sm p-6 sm:p-10 text-center space-y-5 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-blue-500/10 border-amber-500/30"
      >
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Ready to Clear US CMA Part 1 on Your First Try?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Take 5 sample exam questions in full Prometric CBT format. No credit card or sign-in required to start.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onTryFreeQuestions}
            className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-md transition-transform hover:scale-102 cursor-pointer"
          >
            Start 5 Free Questions Now
          </button>
          <button
            onClick={onOpenTalkToUs}
            className="px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-2"
          >
            <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
            <span>Talk to us</span>
          </button>
        </div>
      </section>
    </div>
  );
};
