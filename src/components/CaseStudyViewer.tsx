import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Flag,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Calculator,
  Eye,
  EyeOff,
} from 'lucide-react';
import { CaseStudyScenario, Question, TableData } from '../types';
import { PrometricCalculator } from './PrometricCalculator';

interface Props {
  cases: CaseStudyScenario[];
  caseQuestions: Question[];
  isDark: boolean;
  onClose: () => void;
  onAnswerQuestion: (questionId: string, optionId: 'A' | 'B' | 'C' | 'D') => void;
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  onActiveQuestionChange?: (question: Question | null, userAnswer?: string) => void;
}

export const CaseStudyViewer: React.FC<Props> = ({
  cases,
  caseQuestions,
  isDark,
  onClose,
  onAnswerQuestion,
  userAnswers,
  onActiveQuestionChange,
}) => {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [activeExhibitTab, setActiveExhibitTab] = useState<number>(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [strikethroughs, setStrikethroughs] = useState<Record<string, string[]>>({});

  const activeCase = cases[selectedCaseIndex] || cases[0];
  const activeCaseQuestionIds = activeCase ? activeCase.questionIds : [];
  const currentQuestions = activeCaseQuestionIds
    .map((id) => caseQuestions.find((q) => q.id === id))
    .filter((q): q is Question => Boolean(q));

  const currentQuestion = currentQuestions[activeQuestionIndex] || currentQuestions[0];
  const currentSelectedOption = currentQuestion ? userAnswers[currentQuestion.id] : undefined;
  const isQuestionFlagged = currentQuestion ? Boolean(flaggedQuestions[currentQuestion.id]) : false;
  const currentStrikethroughs = currentQuestion ? strikethroughs[currentQuestion.id] || [] : [];

  const onActiveQuestionChangeRef = useRef(onActiveQuestionChange);
  onActiveQuestionChangeRef.current = onActiveQuestionChange;

  // Synchronize active question with parent and FinHornet Gemini chatbot
  useEffect(() => {
    if (currentQuestion) {
      onActiveQuestionChangeRef.current?.(currentQuestion, currentSelectedOption);
    } else {
      onActiveQuestionChangeRef.current?.(null);
    }
    return () => {
      onActiveQuestionChangeRef.current?.(null);
    };
  }, [currentQuestion?.id, currentSelectedOption]);

  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    onAnswerQuestion(currentQuestion.id, optId);
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const toggleStrikethrough = (optId: string) => {
    if (!currentQuestion) return;
    setStrikethroughs((prev) => {
      const list = prev[currentQuestion.id] || [];
      const updated = list.includes(optId) ? list.filter((id) => id !== optId) : [...list, optId];
      return {
        ...prev,
        [currentQuestion.id]: updated,
      };
    });
  };

  if (!activeCase) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">No case studies loaded.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* Top Header Bar */}
      <div
        className="p-4 sm:p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
                CMA Case Study
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {activeCase.domain}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {activeCase.title}
            </h1>
          </div>
        </div>

        {/* Case Switcher & Tool Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedCaseIndex}
            onChange={(e) => {
              setSelectedCaseIndex(Number(e.target.value));
              setActiveExhibitTab(0);
              setActiveQuestionIndex(0);
              setShowExplanation(false);
              setShowHint(false);
            }}
            aria-label="Select CMA Case Scenario"
            className="text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden"
          >
            {cases.map((c, idx) => (
              <option key={c.id} value={idx}>
                Case {idx + 1}: {c.companyName}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
            className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-500" />
            <span>Calculator</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Exhibits / Right Question */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Case Background & Tabbed Exhibits (7 Cols) */}
        <div
          className="lg:col-span-7 rounded-2xl border shadow-sm overflow-hidden flex flex-col"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          {/* Exhibit Tabs Bar */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => setActiveExhibitTab(0)}
              className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                activeExhibitTab === 0
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Background & Context</span>
            </button>
            {activeCase.exhibits.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => setActiveExhibitTab(idx + 1)}
                className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeExhibitTab === idx + 1
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Exhibit {idx + 1}</span>
              </button>
            ))}
          </div>

          {/* Exhibit Content Body */}
          <div className="p-6 overflow-y-auto max-h-[620px] space-y-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {activeExhibitTab === 0 ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                  <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                    Entity Profile: {activeCase.companyName}
                  </div>
                  <div className="text-xs text-blue-800/80 dark:text-blue-300/80">
                    Industry: {activeCase.industry} • Domain: {activeCase.domain} ({activeCase.subtopic})
                  </div>
                </div>

                <div className="whitespace-pre-line text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                  {activeCase.scenarioBackground}
                </div>

                <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                  💡 <strong>Exam Tip:</strong> Click the tabs above to review Exhibit 1, Exhibit 2, and Exhibit 3. Prometric CBT case questions require cross-referencing between exhibits to solve standard variance and allocation calculations.
                </div>
              </div>
            ) : (
              (() => {
                const ex = activeCase.exhibits[activeExhibitTab - 1];
                if (!ex) return null;
                return (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {ex.title}
                      </h3>
                      <span className="text-[11px] font-mono uppercase text-slate-400">
                        {ex.type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="whitespace-pre-line text-xs text-slate-600 dark:text-slate-400">
                      {ex.content}
                    </p>

                    {ex.tableData && (
                      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                        {ex.tableData.title && (
                          <div className="px-3.5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                            {ex.tableData.title}
                          </div>
                        )}
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                            <tr>
                              {ex.tableData.headers.map((h, i) => (
                                <th key={i} className="px-3 py-2.5">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px] sm:text-xs">
                            {ex.tableData.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={rIdx % 2 === 0 ? 'bg-transparent' : 'bg-slate-50/50 dark:bg-slate-900/30'}
                              >
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-3 py-2 text-slate-800 dark:text-slate-200">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Right Side: Active Case Question & Interactive Answering (5 Cols) */}
        <div
          className="lg:col-span-5 rounded-2xl border shadow-sm p-6 space-y-5"
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            borderColor: isDark ? '#1e293b' : '#e2e8f0',
          }}
        >
          {currentQuestion ? (
            <>
              {/* Question Navigation & Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    Question {activeQuestionIndex + 1} of {currentQuestions.length}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {currentQuestion.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleFlag}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                      isQuestionFlagged
                        ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Flag question for review"
                  >
                    <Flag className={`w-3.5 h-3.5 ${isQuestionFlagged ? 'fill-amber-500' : ''}`} />
                    <span className="hidden sm:inline text-[11px] font-semibold">Flag</span>
                  </button>
                </div>
              </div>

              {/* Question Stem */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {currentQuestion.scenario}
                </p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {currentQuestion.questionText}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentSelectedOption === opt.id;
                  const isStriked = currentStrikethroughs.includes(opt.id);

                  return (
                    <div
                      key={opt.id}
                      className={`relative flex items-start gap-3 p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                      } ${isStriked ? 'opacity-40 line-through' : ''}`}
                      onClick={() => handleSelectOption(opt.id)}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {opt.id}
                      </div>

                      <div className="flex-1 font-medium leading-relaxed text-slate-800 dark:text-slate-200 pt-0.5">
                        {opt.text}
                      </div>

                      {/* Strikethrough button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStrikethrough(opt.id);
                        }}
                        className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 opacity-60 hover:opacity-100"
                        title="Eliminate option"
                      >
                        S
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Instant Hint & Solution Controls */}
              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>{showHint ? 'Hide Hint' : 'Instant Hint'}</span>
                </button>

                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-3 py-1.5 rounded-lg border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
                >
                  {showExplanation ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showExplanation ? 'Hide Explanation' : 'Show Why & Solution'}</span>
                </button>
              </div>

              {/* Hint Box */}
              {showHint && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    <span>Calculation Hint:</span>
                  </div>
                  <p>{currentQuestion.conciseHint}</p>
                </div>
              )}

              {/* Full Solution with "Why Each Choice is Wrong" Distractor Analysis */}
              {showExplanation && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px]">
                      Correct Answer: Option {currentQuestion.correctOption}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {currentQuestion.explanation.summary}
                  </p>

                  {/* Step Calculations */}
                  <div className="space-y-2">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      Step-by-Step Mathematical Derivation:
                    </div>
                    {currentQuestion.explanation.steps.map((st, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="font-semibold text-blue-600 dark:text-blue-400">{st.stepTitle}</div>
                        <div className="whitespace-pre-line text-slate-700 dark:text-slate-300 mt-1">{st.detail}</div>
                        {st.mathFormula && (
                          <div className="mt-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-900 p-1.5 rounded-sm text-slate-800 dark:text-slate-200">
                            {st.mathFormula}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Distractor Analysis: Why Wrong! */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-red-500" />
                      <span>Why Your Chosen Option May Be Wrong (Distractor Analysis):</span>
                    </div>

                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const isCorrect = optKey === currentQuestion.correctOption;
                      const isCandidatePicked = currentSelectedOption === optKey;
                      const explanationText = currentQuestion.explanation.distractorAnalysis[optKey];

                      return (
                        <div
                          key={optKey}
                          className={`p-2.5 rounded-lg border ${
                            isCorrect
                              ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/60'
                              : isCandidatePicked
                              ? 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/40 dark:border-rose-900'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold mb-1">
                            {isCorrect ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            )}
                            <span className={isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}>
                              Option {optKey} {isCorrect ? '(Correct)' : '(Distractor)'}
                            </span>
                            {isCandidatePicked && !isCorrect && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-rose-200 text-rose-900 font-bold ml-1">
                                Your Selection
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                            {explanationText}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  disabled={activeQuestionIndex === 0}
                  onClick={() => {
                    setActiveQuestionIndex((prev) => Math.max(0, prev - 1));
                    setShowExplanation(false);
                    setShowHint(false);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-xs font-bold flex items-center gap-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  disabled={activeQuestionIndex === currentQuestions.length - 1}
                  onClick={() => {
                    setActiveQuestionIndex((prev) => Math.min(currentQuestions.length - 1, prev + 1));
                    setShowExplanation(false);
                    setShowHint(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500">No questions found for this case scenario.</p>
          )}
        </div>
      </div>

      {/* Embedded Prometric Calculator */}
      {isCalculatorOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <PrometricCalculator
            isOpen={isCalculatorOpen}
            onClose={() => setIsCalculatorOpen(false)}
            isDark={isDark}
          />
        </div>
      )}
    </div>
  );
};
