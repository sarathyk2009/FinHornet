import React, { useState, useEffect, useRef } from 'react';
import {
  Flag,
  Calculator as CalcIcon,
  BookOpen,
  FileText,
  Clock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Moon,
  Sun,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Strikethrough,
} from 'lucide-react';
import { Question, ExamSession } from '../types';
import { formatTimeRemaining } from '../utils/scoring';
import { PrometricCalculator } from './PrometricCalculator';
import { PrometricScratchpad } from './PrometricScratchpad';
import { FormulaExhibitModal } from './FormulaExhibitModal';
import { PrometricReviewModal } from './PrometricReviewModal';

interface Props {
  session: ExamSession;
  questions: Question[];
  isDark: boolean;
  onToggleDark: () => void;
  candidateName: string;
  candidateId: string;
  isPremium: boolean;
  freeCount: number;
  onAnswerQuestion: (questionId: string, optionId: 'A' | 'B' | 'C' | 'D') => void;
  onToggleFlag: (questionId: string) => void;
  onToggleStrikethrough: (questionId: string, optionId: string) => void;
  onUpdateNotes: (questionId: string, note: string) => void;
  onEndExam: () => void;
  onOpenUpgradeModal: () => void;
  onExitToDashboard: () => void;
  onActiveQuestionChange?: (question: Question | null, userAnswer?: string) => void;
}

export const PrometricExamUI: React.FC<Props> = ({
  session,
  questions,
  isDark,
  onToggleDark,
  candidateName,
  candidateId,
  isPremium,
  freeCount,
  onAnswerQuestion,
  onToggleFlag,
  onToggleStrikethrough,
  onUpdateNotes,
  onEndExam,
  onOpenUpgradeModal,
  onExitToDashboard,
  onActiveQuestionChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTime, setShowTime] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(session.timeRemainingSeconds);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [showExplanation, setShowExplanation] = useState(session.mode === 'practice-immediate');

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Active question state
  const userAnswer = currentQ ? session.userAnswers[currentQ.id] : undefined;
  const isFlagged = currentQ ? session.flaggedQuestionIds.includes(currentQ.id) : false;
  const strikedList = currentQ ? session.strikethroughs[currentQ.id] || [] : [];
  const currentNote = currentQ ? session.notes[currentQ.id] || '' : '';
  const isAnswerWrong = userAnswer && currentQ && userAnswer !== currentQ.correctOption;
  const isAnswerCorrect = userAnswer && currentQ && userAnswer === currentQ.correctOption;

  // Store latest callbacks in refs to avoid restarting intervals or re-running effects on callback reference changes
  const onEndExamRef = useRef(onEndExam);
  onEndExamRef.current = onEndExam;
  const onActiveQuestionChangeRef = useRef(onActiveQuestionChange);
  onActiveQuestionChangeRef.current = onActiveQuestionChange;

  // Countdown timer effect
  useEffect(() => {
    if (session.submitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onEndExamRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session.submitted]);

  // Synchronize the currently active question with the parent and Gemini tutor
  useEffect(() => {
    if (currentQ) {
      onActiveQuestionChangeRef.current?.(currentQ, userAnswer);
    } else {
      onActiveQuestionChangeRef.current?.(null);
    }
  }, [currentQ?.id, userAnswer]);

  if (!currentQ) {
    return (
      <div className="p-8 text-center text-slate-500">
        No questions loaded.
        <button onClick={onExitToDashboard} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleOptionClick = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (session.submitted) return;

    // Check if free user is exceeding 5 questions
    const answeredCount = Object.keys(session.userAnswers).length;
    if (!isPremium && freeCount >= 5 && !session.userAnswers[currentQ.id]) {
      onOpenUpgradeModal();
      return;
    }

    onAnswerQuestion(currentQ.id, optId);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowConfirmEnd(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans select-text ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* =========================================================================
          PROMETRIC TOP TITLE / CANDIDATE IDENTITY BAR (Authentic CBT Header)
         ========================================================================= */}
      <header
        className="border-b px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs"
        style={{
          backgroundColor: isDark ? '#090d16' : '#1e3a5f',
          borderColor: isDark ? '#1e293b' : '#162e4c',
          color: '#ffffff',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-sky-500 text-white font-bold flex items-center justify-center text-xs tracking-wider shadow-inner">
            CMA
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2">
              <span>{session.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-900/80 text-sky-200 border border-sky-600/40 font-mono">
                {session.mode === 'practice-immediate' ? 'Study & Practice Mode' : 'Prometric CBT'}
              </span>
            </div>
            <div className="text-[11px] text-sky-200 flex items-center gap-3 font-mono">
              <span>Candidate: {candidateName}</span>
              <span>•</span>
              <span>ID: {candidateId}</span>
              {!isPremium && (
                <>
                  <span>•</span>
                  <button
                    onClick={onOpenUpgradeModal}
                    className="text-amber-300 font-bold hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Free Trial ({freeCount}/5)</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Prometric Top Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Timer with Toggle */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded border shadow-inner"
            style={{
              backgroundColor: isDark ? '#020617' : '#0f243e',
              borderColor: isDark ? '#1e293b' : '#2b4d77',
            }}
          >
            <Clock className={`w-3.5 h-3.5 ${timeRemaining < 300 ? 'text-red-400 animate-pulse' : 'text-sky-300'}`} />
            {showTime ? (
              <span className={`font-mono font-bold text-xs sm:text-sm ${timeRemaining < 300 ? 'text-red-400' : 'text-sky-100'}`}>
                {formatTimeRemaining(timeRemaining)}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 italic">Time Hidden</span>
            )}
            <button
              onClick={() => setShowTime(!showTime)}
              title={showTime ? 'Hide Timer' : 'Show Timer'}
              className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
            >
              {showTime ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Calculator Tool Button */}
          <button
            onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
            className="px-2.5 py-1.5 rounded bg-sky-800/60 hover:bg-sky-700 text-sky-100 border border-sky-600/50 flex items-center gap-1.5 transition-colors"
            title="Open On-Screen Prometric Calculator"
          >
            <CalcIcon className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden md:inline font-medium">Calculator</span>
          </button>

          {/* Formula Exhibits Button */}
          <button
            onClick={() => setIsFormulaModalOpen(true)}
            className="px-2.5 py-1.5 rounded bg-sky-800/60 hover:bg-sky-700 text-sky-100 border border-sky-600/50 flex items-center gap-1.5 transition-colors"
            title="Open Exam Formula Sheet & Exhibits"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline font-medium">Exhibits</span>
          </button>

          {/* Scratchpad Button */}
          <button
            onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
            className="px-2.5 py-1.5 rounded bg-sky-800/60 hover:bg-sky-700 text-sky-100 border border-sky-600/50 flex items-center gap-1.5 transition-colors"
            title="Open Candidate Scratchpad"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden md:inline font-medium">Scratchpad</span>
          </button>

          {/* Dark Mode Setting Toggle (for eye strain reduction) */}
          <button
            onClick={onToggleDark}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded bg-sky-800/60 hover:bg-sky-700 text-sky-100 border border-sky-600/50 transition-colors"
            title={isDark ? 'Prometric CBT Classic Skin' : 'Dark Mode (Reduce Eye Strain)'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-200" />}
          </button>

          <button
            onClick={onExitToDashboard}
            className="px-2.5 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* =========================================================================
          PROMETRIC SECONDARY TOOLBAR: QUESTION COUNTER & FLAG FOR REVIEW
         ========================================================================= */}
      <div
        className="px-4 py-2 border-b flex items-center justify-between text-xs font-semibold select-none shadow-2xs"
        style={{
          backgroundColor: isDark ? '#0f172a' : '#e2e8f0',
          borderColor: isDark ? '#1e293b' : '#cbd5e1',
          color: isDark ? '#cbd5e1' : '#334155',
        }}
      >
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-slate-400 dark:text-slate-500">|</span>
          <span className="text-blue-700 dark:text-blue-400 font-medium">
            {currentQ.domain}
          </span>
          <span className="hidden sm:inline text-slate-500 text-[11px]">
            ({currentQ.subtopic})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Flag for Review Control */}
          <button
            onClick={() => onToggleFlag(currentQ.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded border transition-all ${
              isFlagged
                ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-amber-400'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-slate-950 text-slate-950' : 'text-amber-500'}`} />
            <span>{isFlagged ? 'Flagged for Review' : 'Flag for Review'}</span>
          </button>

          {/* Quick Review Screen Launcher */}
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>Review Screen</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN TEST CONTENT AREA (Prometric CBT Window)
         ========================================================================= */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Question Scenario & Prompt Box */}
          <div
            className="p-5 rounded-xl border shadow-xs"
            style={{
              backgroundColor: isDark ? '#0b1120' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
            }}
          >
            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 mb-4 whitespace-pre-line font-serif">
              {currentQ.scenario}
            </p>

            {/* Exhibit Table Data (if present) */}
            {currentQ.tableData && (
              <div
                className={`my-4 overflow-x-auto rounded-lg border p-3 ${
                  isDark
                    ? 'border-slate-700 bg-slate-900/90 text-slate-100'
                    : 'border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                {currentQ.tableData.title && (
                  <h4
                    className={`text-xs font-bold mb-2 font-mono ${
                      isDark ? 'text-sky-300' : 'text-slate-700'
                    }`}
                  >
                    {currentQ.tableData.title}
                  </h4>
                )}
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr
                      className={`border-b font-semibold ${
                        isDark
                          ? 'border-slate-700 text-slate-200 bg-slate-800'
                          : 'border-slate-300 text-slate-700 bg-slate-200/70'
                      }`}
                    >
                      {currentQ.tableData.headers.map((h, hIdx) => (
                        <th
                          key={hIdx}
                          className={`py-1.5 px-3 border-r last:border-none ${
                            isDark ? 'border-slate-700' : 'border-slate-300'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y font-mono ${
                      isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'
                    }`}
                  >
                    {currentQ.tableData.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={`transition-colors ${
                          isDark ? 'hover:bg-slate-800/60' : 'hover:bg-blue-50/50'
                        }`}
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-1.5 px-3 border-r last:border-none ${
                              isDark ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-800'
                            } ${cIdx > 0 ? 'text-right' : ''}`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div
              className={`pt-2 border-t ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              <p
                className={`text-sm sm:text-base font-bold ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                {currentQ.questionText}
              </p>
            </div>
          </div>

          {/* Multiple Choice Radio Buttons Options (A, B, C, D) */}
          <div className="space-y-2.5" role="radiogroup" aria-label="Multiple choice answers">
            {currentQ.options.map((opt) => {
              const isSelected = userAnswer === opt.id;
              const isStriked = strikedList.includes(opt.id);

              return (
                <div
                  key={opt.id}
                  className={`relative flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-500'
                      : isStriked
                      ? 'opacity-40 bg-slate-100 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <label
                    onClick={() => handleOptionClick(opt.id)}
                    className="flex-1 flex items-start gap-3.5 cursor-pointer select-none"
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {opt.id}
                    </div>
                    <span
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isStriked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {opt.text}
                    </span>
                  </label>

                  {/* Strikethrough Tool Icon (Elimination Tool) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStrikethrough(currentQ.id, opt.id);
                    }}
                    title={isStriked ? 'Remove strikethrough' : 'Strike through to eliminate choice'}
                    className={`p-1.5 rounded transition-colors text-xs ${
                      isStriked
                        ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* =========================================================================
              STEP-BY-STEP LOGIC & CONCISE HINT SECTION
              "If the answer is wrong, provide a concise hint and explain the correct logic step by step."
             ========================================================================= */}
          {userAnswer && (
            <div className="pt-2 animate-in fade-in slide-in-from-top-2">
              {/* If wrong: High visibility diagnostic of why the selected answer is wrong */}
              {isAnswerWrong && (
                <div className="space-y-3 mb-4">
                  {/* Dedicated "Why Your Choice is Wrong" card */}
                  <div className="p-4 rounded-xl border bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 flex-1">
                        <div className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider flex items-center justify-between">
                          <span>Why Your Selection (Option {userAnswer}) is Wrong:</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-100">
                            INCORRECT
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-rose-900 dark:text-rose-100 leading-relaxed font-medium">
                          {currentQ.explanation.distractorAnalysis[userAnswer]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Concise Concept Hint */}
                  <div className="p-4 rounded-xl border bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/60 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-2">
                          <span>Concise Concept Hint:</span>
                          <span className="text-[10px] font-normal px-1.5 py-0.5 bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded">
                            Correct Answer is Option {currentQ.correctOption}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 leading-relaxed font-medium">
                          {currentQ.conciseHint}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* If correct: Confirmation banner */}
              {isAnswerCorrect && (
                <div className="mb-4 p-3.5 rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60 shadow-xs flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-semibold">
                    Correct! Option {currentQ.correctOption} is right.
                  </div>
                </div>
              )}

              {/* Step-by-Step Logic Explanation Drawer/Card */}
              <div
                className="rounded-xl border overflow-hidden shadow-xs"
                style={{
                  backgroundColor: isDark ? '#0d1526' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                }}
              >
                <div
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-4 py-3 cursor-pointer flex items-center justify-between border-b bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span>Step-by-Step Solution & Detailed Calculation Logic</span>
                  </div>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    {showExplanation ? 'Hide Details' : 'Show Details'}
                  </span>
                </div>

                {showExplanation && (
                  <div className="p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
                    {/* Summary */}
                    <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 leading-relaxed">
                      <strong>Executive Summary:</strong> {currentQ.explanation.summary}
                    </div>

                    {/* Sequential Steps */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Step-by-Step Breakdown:
                      </h4>
                      {currentQ.explanation.steps.map((st, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-3.5 rounded-lg border bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 space-y-1.5"
                        >
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                              {sIdx + 1}
                            </span>
                            <span>{st.stepTitle}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                            {st.detail}
                          </p>
                          {st.mathFormula && (
                            <div className="font-mono text-xs bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-sky-700 dark:text-sky-300 font-bold inline-block">
                              {st.mathFormula}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Distractor Rationale (Why other choices are incorrect) */}
                    <div className="pt-2">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                        Option Analysis (Distractor Traps):
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {(['A', 'B', 'C', 'D'] as const).map((key) => (
                          <div
                            key={key}
                            className={`p-2.5 rounded border ${
                              key === currentQ.correctOption
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="font-bold mr-1">Option {key}:</span>
                            <span>{currentQ.explanation.distractorAnalysis[key]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            PROMETRIC BOTTOM NAVIGATION BAR
           ========================================================================= */}
        <div
          className="mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-3 select-none"
          style={{ borderColor: isDark ? '#1e293b' : '#cbd5e1' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded font-semibold text-xs flex items-center gap-1 border transition-colors ${
                currentIndex === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-500 border-transparent'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 rounded font-semibold text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Review Screen
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfirmEnd(true)}
              className="px-4 py-2 rounded font-semibold text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-colors"
            >
              End Exam
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>{isLastQuestion ? 'Review & Submit' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Floating On-Screen Prometric Tools */}
      <PrometricCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        isDark={isDark}
      />

      <PrometricScratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        isDark={isDark}
        notes={currentNote}
        onNotesChange={(text) => onUpdateNotes(currentQ.id, text)}
        questionNumber={currentIndex + 1}
      />

      <FormulaExhibitModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        isDark={isDark}
      />

      <PrometricReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        questions={questions}
        userAnswers={session.userAnswers}
        flaggedQuestionIds={session.flaggedQuestionIds}
        currentIndex={currentIndex}
        onSelectQuestion={(idx) => setCurrentIndex(idx)}
        onEndExam={onEndExam}
        isDark={isDark}
      />

      {/* End Exam Confirmation Modal */}
      {showConfirmEnd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-label="Confirm Ending Exam"
        >
          <div
            className="w-full max-w-md p-6 rounded-xl shadow-2xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Are you sure you want to end this exam?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              You have answered {Object.keys(session.userAnswers).length} of {questions.length} questions.
              {session.flaggedQuestionIds.length > 0 && (
                <span className="block mt-1 font-semibold text-amber-600 dark:text-amber-400">
                  Notice: You still have {session.flaggedQuestionIds.length} flagged question(s) marked for review.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => setShowConfirmEnd(false)}
                className="px-4 py-2 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
              >
                Return to Questions
              </button>
              <button
                onClick={() => {
                  setShowConfirmEnd(false);
                  onEndExam();
                }}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
