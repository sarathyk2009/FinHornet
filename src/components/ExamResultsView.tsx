import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BarChart2,
  Sparkles,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Flag,
} from 'lucide-react';
import { Question, ExamAttemptSummary } from '../types';

interface Props {
  attempt: ExamAttemptSummary;
  questions: Question[];
  isDark: boolean;
  onRetake: () => void;
  onGoToDashboard: () => void;
  onActiveQuestionChange?: (question: Question | null, userAnswer?: string) => void;
}

export const ExamResultsView: React.FC<Props> = ({
  attempt,
  questions,
  isDark,
  onRetake,
  onGoToDashboard,
  onActiveQuestionChange,
}) => {
  const [expandedQId, setExpandedQId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const attemptQuestions = attempt.questionIds
    .map((id) => questionMap.get(id))
    .filter((q): q is Question => Boolean(q));

  const onActiveQuestionChangeRef = useRef(onActiveQuestionChange);
  onActiveQuestionChangeRef.current = onActiveQuestionChange;

  // Synchronize expanded question with Gemini Chatbot
  useEffect(() => {
    if (expandedQId) {
      const q = questionMap.get(expandedQId) || null;
      onActiveQuestionChangeRef.current?.(q, q ? attempt.answers[q.id] : undefined);
    } else {
      onActiveQuestionChangeRef.current?.(null);
    }
    return () => {
      onActiveQuestionChangeRef.current?.(null);
    };
  }, [expandedQId]);

  const filtered = attemptQuestions.filter((q) => {
    const isCorrect = attempt.answers[q.id] === q.correctOption;
    if (filter === 'incorrect') return !isCorrect;
    if (filter === 'correct') return isCorrect;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Results Hero Card */}
      <div
        className="p-6 sm:p-8 rounded-2xl border shadow-sm text-center relative overflow-hidden"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div className="max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <span>{attempt.title} Results</span>
          </div>

          {attempt.passed ? (
            <div className="space-y-1">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                Congratulations! You Passed
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                You met the ICMA passing standard of 360 scaled points or higher.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                Exam Completed — Keep Pushing!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Target is 360 scaled points. Review the step-by-step logic below to master missed concepts.
              </p>
            </div>
          )}

          {/* Scaled Score Callout */}
          <div className="py-4 flex justify-center items-baseline gap-2 font-mono">
            <span className="text-5xl font-black text-slate-900 dark:text-slate-100">
              {attempt.scaledScore}
            </span>
            <span className="text-sm text-slate-400">/ 500 Scaled Score</span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Raw Accuracy</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-base font-mono">
                {attempt.accuracy}%
              </span>
              <span className="text-slate-400 text-[10px] block">
                ({attempt.score}/{attempt.total} correct)
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Time Spent</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-base font-mono">
                {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
              </span>
              <span className="text-slate-400 text-[10px] block">Total Duration</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Passing Mark</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 text-base font-mono">
                360 / 500
              </span>
              <span className="text-slate-400 text-[10px] block">CMA Benchmark</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={onRetake}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Mock Exam</span>
            </button>
            <button
              onClick={onGoToDashboard}
              className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          Question-by-Question Review & Explanations
        </h3>
        <div className="flex gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg border transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            All ({attemptQuestions.length})
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`px-3 py-1 rounded-lg border transition-colors ${
              filter === 'incorrect'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Incorrect ({attemptQuestions.filter((q) => attempt.answers[q.id] !== q.correctOption).length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-3 py-1 rounded-lg border transition-colors ${
              filter === 'correct'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            Correct ({attemptQuestions.filter((q) => attempt.answers[q.id] === q.correctOption).length})
          </button>
        </div>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-4">
        {filtered.map((q, idx) => {
          const userAns = attempt.answers[q.id];
          const isCorrect = userAns === q.correctOption;
          const isExpanded = expandedQId === q.id;

          return (
            <div
              key={q.id}
              className="rounded-2xl border shadow-xs overflow-hidden transition-all"
              style={{
                backgroundColor: isDark ? '#0b1120' : '#ffffff',
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
              }}
            >
              <div
                onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                className="p-4 sm:p-5 cursor-pointer flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                    }`}
                  >
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      Question {idx + 1}: {q.domain}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Your Answer: <strong className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>{userAns || 'Unanswered'}</strong> • Correct Answer: <strong className="text-emerald-600">{q.correctOption}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {isExpanded ? 'Hide Logic' : 'View Logic'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Expanded Explanations */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-4 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-900/40">
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                    {q.scenario}
                  </p>

                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {q.questionText}
                  </div>

                  {/* Why Your Selection is Wrong */}
                  {!isCorrect && userAns && (
                    <div className="p-3.5 rounded-xl border bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-rose-800 dark:text-rose-200">
                          Why Your Selection (Option {userAns}) is Wrong:
                        </div>
                        <div className="text-xs text-rose-900 dark:text-rose-100 font-medium leading-relaxed">
                          {q.explanation.distractorAnalysis[userAns]}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Concise Hint */}
                  {!isCorrect && (
                    <div className="p-3.5 rounded-xl border bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 flex items-start gap-2.5">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-200">
                          Concise Concept Hint:
                        </div>
                        <div className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                          {q.conciseHint}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step by Step Logic */}
                  <div className="space-y-3 pt-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      Step-by-Step Logic Breakdown:
                    </h5>
                    {q.explanation.steps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-1"
                      >
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {step.stepTitle}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                          {step.detail}
                        </div>
                        {step.mathFormula && (
                          <div className="font-mono text-xs text-sky-600 dark:text-sky-300 font-bold bg-slate-50 dark:bg-slate-950 p-1.5 rounded inline-block">
                            {step.mathFormula}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
