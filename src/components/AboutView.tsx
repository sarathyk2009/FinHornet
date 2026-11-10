import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Target,
  Award,
  BookOpen,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Users,
  Layers,
  Clock,
} from 'lucide-react';
import { FinHornetLogo } from './FinHornetLogo';

interface Props {
  isDark: boolean;
  onOpenTalkToUs: () => void;
  onTryExam: () => void;
}

export const AboutView: React.FC<Props> = ({
  isDark,
  onOpenTalkToUs,
  onTryExam,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 w-full max-w-full box-border">
      {/* Hero Banner with Collaborative Workspace Photography & Dark Gradient Overlay */}
      <div
        className="relative overflow-hidden rounded-3xl border shadow-lg text-center min-h-[360px] flex flex-col justify-end p-8 sm:p-12 transition-all w-full max-w-full box-border"
        style={{
          borderColor: isDark ? '#1e293b' : '#cbd5e1',
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"
          alt="Collaborative workspace and professional study cohort"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay gradient behind mission statement text */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-center mb-1">
            <FinHornetLogo size="lg" showSubtitle={false} />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 inline-flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Our Mission & Teaching Philosophy</span>
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-sm">
            Where Numbers Meet Nerve
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            FinHornet was created with a single objective: to build the world's most authentic, analytically rigorous exam
            simulator for US CMA (Certified Management Accountant) candidates.
          </p>
        </div>
      </div>

      {/* Philosophy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-3"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            No Memorization Without Derivation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The CMA exam tests deep conceptual application, not rote memorization. We break down complex cost curves,
            reconciliations, and variance trees into clear, foundational mathematical steps so you can solve novel
            variations with confidence.
          </p>
        </div>

        <div
          className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-3"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Authentic Prometric Muscle Memory
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Exam anxiety is conquered through familiarity. Our platform accurately mimics Prometric computer-based
            testing (CBT): from the question navigator and strikethrough logic to standard Prometric scratchpads and the
            108-second pacing discipline.
          </p>
        </div>
      </div>

      {/* Syllabus Focus Breakdown */}
      <div
        className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-4"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          US CMA Part 1: Financial Planning, Performance, and Analytics
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          FinHornet covers the entire ICMA 2026/2027 Content Specification Outline across all 6 core domains:
        </p>

        <div className="space-y-2.5 pt-2">
          {[
            { name: 'External Financial Reporting Decisions', weight: '15%', desc: 'Financial statements, recognition, measurement, valuation, and disclosures.' },
            { name: 'Planning, Budgeting, and Forecasting', weight: '20%', desc: 'Strategic planning, budgeting concepts, annual profit plans, pro-formas.' },
            { name: 'Cost Management', weight: '20%', desc: 'Measurement concepts, costing systems, overhead variance trees, supply chain.' },
            { name: 'Performance Management', weight: '20%', desc: 'Cost and variance measures, responsibility centers, transfer pricing.' },
            { name: 'Internal Controls', weight: '15%', desc: 'Governance, risk, compliance, internal auditing, and system security.' },
            { name: 'Technology and Analytics', weight: '10%', desc: 'Information systems, data governance, business analytics, and visualization.' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs gap-3"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.name}</span>
                <span className="text-slate-500 text-[11px] block">{item.desc}</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono font-bold shrink-0">
                {item.weight}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Advisory Callout */}
      <div className="p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-blue-500/10 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Have Questions About Your CMA Journey?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Whether you're starting your CMA preparation or looking for custom test window strategy, our senior mentors are here to help.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenTalkToUs}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-500 text-slate-950 flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Request a Free Mentor Callback</span>
          </button>
          <button
            onClick={onTryExam}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
          >
            <span>Try 5 Sample Questions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
