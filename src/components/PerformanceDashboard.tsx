import React, { useState } from 'react';
import {
  Award,
  Clock,
  Target,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Play,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  Flame,
  Shield,
  Layers,
  FileSpreadsheet,
  Zap,
  ArrowRight,
  LogIn,
  UserCheck,
} from 'lucide-react';
import { ExamAttemptSummary, DomainStats, UserAccount, CMAPart } from '../types';
import { calculateSpeedEfficiency } from '../utils/scoring';

interface Props {
  user: UserAccount;
  attempts: ExamAttemptSummary[];
  domainStats: DomainStats[];
  isDark: boolean;
  onStartExam: (part: CMAPart | 'both', mode: 'prometric-timed' | 'practice-immediate') => void;
  onStartCaseStudy: () => void;
  onReviewAttempt: (attempt: ExamAttemptSummary) => void;
  onOpenUpgradeModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAuth: () => void;
  caseCount?: number;
  questionCount?: number;
  firestoreSynced?: boolean;
}

export const PerformanceDashboard: React.FC<Props> = ({
  user,
  attempts,
  domainStats,
  isDark,
  onStartExam,
  onStartCaseStudy,
  onReviewAttempt,
  onOpenUpgradeModal,
  onOpenProfileModal,
  onOpenAuth,
  caseCount = 2,
  questionCount,
  firestoreSynced = true,
}) => {
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');

  // Aggregate metrics
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter((a) => a.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  const avgScaledScore =
    totalAttempts > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.scaledScore, 0) / totalAttempts)
      : 340;

  const totalTimeSpent = attempts.reduce((acc, a) => acc + a.timeSpentSeconds, 0);
  const totalQuestionsDone = attempts.reduce((acc, a) => acc + a.total, 0);
  const speedEfficiency = calculateSpeedEfficiency(totalTimeSpent, totalQuestionsDone);

  // Scaled score gauge calculations (0 to 500, passing mark is 360)
  const gaugePercent = Math.min(100, Math.max(0, (avgScaledScore / 500) * 100));
  const isPassingReady = avgScaledScore >= 360;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* =========================================================================
          HERO BANNER: Spacious, Clean & Responsive
         ========================================================================= */}
      <div
        className="relative overflow-hidden rounded-3xl border shadow-sm p-5 sm:p-7 lg:p-8 transition-all w-full max-w-full box-border"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl min-w-0 flex-1">
            {/* Status Badges - neatly wrapped with consistent sizing */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 shrink-0">
                US CMA Part 1 • ICMA CSO 2026/2027
              </span>

              {user.isGuest ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1.5 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Guest Mode ({user.freeQuestionsUsed}/{user.maxFreeQuestions} Free Questions)</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1.5 shrink-0">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Candidate ID: {user.candidateId}</span>
                </span>
              )}

              {questionCount !== undefined && (
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-1.5 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Firestore: {questionCount} Live Questions</span>
                </span>
              )}

              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full shrink-0">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{user.streakDays}-Day Streak</span>
              </span>
            </div>

            {/* Title & Description with balanced, readable typography */}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug break-words">
                {user.isGuest ? 'Welcome to FinHornet' : `Welcome back, ${user.name}`}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed break-words">
                {user.isGuest
                  ? 'Take up to 5 free exam questions without signing in. Complete them to unlock an exclusive 50% discount!'
                  : `Active Focus: Financial Planning, Performance & Analytics. Target Testing Window: ${user.targetExamWindow}.`}
              </p>
            </div>

            {/* Free Trial Progress Bar (if not premium) */}
            {!user.isPremium && (
              <div className="pt-1 max-w-md">
                <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  <span>Free Trial Progress</span>
                  <span>{user.freeQuestionsUsed} of {user.maxFreeQuestions} Questions Explored</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (user.freeQuestionsUsed / user.maxFreeQuestions) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onStartExam('part1', 'prometric-timed')}
              className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Simulate Part 1 CBT Exam</span>
            </button>

            <button
              onClick={onStartCaseStudy}
              className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 transition-colors"
            >
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Explore Case Scenarios ({caseCount})</span>
            </button>

            {user.isGuest ? (
              <button
                onClick={onOpenAuth}
                className="px-5 py-2.5 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Create Account</span>
              </button>
            ) : (
              <button
                onClick={onOpenProfileModal}
                className="px-5 py-2.5 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors"
              >
                <span>Edit Candidate Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
      {/* =========================================================================
          KEY PERFORMANCE METRICS: 4 Balanced Metric Cards
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full max-w-full box-border">
        {/* Readiness Score Card */}
        <div
          className="p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 w-full max-w-full box-border"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
              CMA Readiness Gauge
            </span>
            <Award className="w-5 h-5 text-blue-500 shrink-0" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                {avgScaledScore}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ 500 Scaled</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isPassingReady ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                style={{ width: `${gaugePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0</span>
              <span className="text-amber-500 font-bold">Pass: 360</span>
              <span>500</span>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 break-words">
            {isPassingReady ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Above official 360 passing line
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {360 - avgScaledScore} points to 360 passing
              </span>
            )}
          </p>
        </div>

        {/* Mock Exam Pass Rate */}
        <div
          className="p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 w-full max-w-full box-border"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Simulation Pass Rate
            </span>
            <Target className="w-5 h-5 text-emerald-500 shrink-0" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {passRate}%
            </div>
            <p className="text-xs text-slate-500 mt-1 break-words">
              {passedAttempts} of {totalAttempts} mock sessions passed
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <ArrowUpRight className="w-4 h-4 shrink-0" />
            <span>Target: 80%+ consistent accuracy</span>
          </div>
        </div>

        {/* Exam Pacing & Speed */}
        <div
          className="p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 w-full max-w-full box-border"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Exam Speed & Pacing
            </span>
            <Clock className="w-5 h-5 text-sky-500 shrink-0" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {speedEfficiency.formattedAvg}
            </div>
            <p className="text-xs text-slate-500 mt-1 break-words">
              Target: 1m 48s (108s) per question
            </p>
          </div>
          <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
            Pacing Status: {speedEfficiency.paceStatus}
          </div>
        </div>

        {/* Total Questions Solved */}
        <div
          className="p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 w-full max-w-full box-border"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total Practiced
            </span>
            <BarChart3 className="w-5 h-5 text-purple-500 shrink-0" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {totalQuestionsDone}
            </div>
            <p className="text-xs text-slate-500 mt-1 break-words">
              {user.isPremium ? 'Unlimited Pro Access' : `${user.freeQuestionsUsed}/5 Free Samples Explored`}
            </p>
          </div>
          <div className="text-xs font-bold text-purple-600 dark:text-purple-400">
            {user.totalXp} XP Points Accumulated
          </div>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE STUDY MODES: 4 Core Modules
         ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            CMA Part 1 Interactive Study Hub
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Choose your preparation method
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Module 1: CBT Simulation */}
          <div
            onClick={() => onStartExam('part1', 'prometric-timed')}
            className="p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Play className="w-6 h-6 fill-current" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                Prometric CBT Simulation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Authentic 100-MCQ timed mock exam with on-screen calculator, strikethrough, question flagging, and Prometric review screens.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 gap-1.5 pt-2">
              <span>Start 100-MCQ Simulation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 2: Case Study & Exhibit Scenarios */}
          <div
            onClick={onStartCaseStudy}
            className="p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                  Case Studies & Exhibits
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                  New
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Multi-product standard variance investigations and ASC 606 revenue cases with tabbed exhibits, cost cards, and linked questions.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1.5 pt-2">
              <span>View Case Scenarios</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 3: Rapid Practice & Distractor Clinic */}
          <div
            onClick={() => onStartExam('part1', 'practice-immediate')}
            className="p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors">
                Practice & Distractor Clinic
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Immediate answers, instant step-by-step math formulas, and comprehensive "Why each option is wrong" distractor breakdowns.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 gap-1.5 pt-2">
              <span>Start Instant Practice</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Module 4: Formulas & Statements */}
          <div
            onClick={onStartCaseStudy}
            className="p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                CMA Formulas & Ratios
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Official CMA Part 1 standard costing variance trees, inventory costing reconciliations, and financial performance equations.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1.5 pt-2">
              <span>Explore Formulas Sheet</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DOMAIN MASTERY PROGRESS: Spacious Grid
         ========================================================================= */}
      <div
        className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              US CMA Part 1 Domain Mastery Matrix
            </h2>
            <p className="text-xs text-slate-500">
              Coverage across official ICMA Content Specification Outlines
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Benchmark:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              75%+ Target
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domainStats.map((d, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug">
                  {d.domain}
                </h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                    d.status === 'Mastered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : d.status === 'Proficient'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {d.status}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono font-bold mb-1 text-slate-600 dark:text-slate-300">
                  <span>Accuracy</span>
                  <span>{d.accuracy}% ({d.totalCorrect}/{d.totalAnswered})</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      d.accuracy >= 75 ? 'bg-emerald-500' : d.accuracy >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${d.accuracy}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          RECENT ATTEMPTS & SIMULATION HISTORY: Spacious Table
         ========================================================================= */}
      <div
        id="performance-history"
        className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-4 scroll-mt-24"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Recent Exam Simulations & Practice History
            </h2>
            <p className="text-xs text-slate-500">
              Click any attempt to review correct answers and wrong option rationales
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3">Session Title</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Raw Score</th>
                <th className="py-3 px-3">Scaled Score (0-500)</th>
                <th className="py-3 px-3">Passing Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {attempts.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {att.title}
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 font-mono">
                    {att.date}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold">
                    {att.score} / {att.total} ({att.accuracy}%)
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {att.scaledScore} / 500
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                        att.passed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {att.passed ? 'PASSED (≥360)' : 'NEEDS WORK'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onReviewAttempt(att)}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                    >
                      Review Rationale
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
