import React, { useState } from 'react';
import { X, Flag, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { Question } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  userAnswers: Record<string, string>;
  flaggedQuestionIds: string[];
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
  onEndExam: () => void;
  isDark?: boolean;
}

export const PrometricReviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  questions,
  userAnswers,
  flaggedQuestionIds,
  currentIndex,
  onSelectQuestion,
  onEndExam,
  isDark,
}) => {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'incomplete'>('all');

  if (!isOpen) return null;

  const total = questions.length;
  const answeredCount = Object.keys(userAnswers).filter((id) => userAnswers[id]).length;
  const unansweredCount = total - answeredCount;
  const flaggedCount = flaggedQuestionIds.length;

  const filteredQuestions = questions
    .map((q, idx) => ({
      question: q,
      index: idx,
      isAnswered: Boolean(userAnswers[q.id]),
      isFlagged: flaggedQuestionIds.includes(q.id),
      selectedOption: userAnswers[q.id] || null,
    }))
    .filter((item) => {
      if (filter === 'flagged') return item.isFlagged;
      if (filter === 'incomplete') return !item.isAnswered;
      return true;
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-label="Prometric Exam Review Screen"
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl border flex flex-col overflow-hidden"
        style={{
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderColor: isDark ? '#334155' : '#cbd5e1',
        }}
      >
        {/* Prometric Header */}
        <div
          className="flex items-center justify-between px-4 py-3 select-none text-sm font-semibold"
          style={{
            backgroundColor: isDark ? '#020617' : '#1e3a5f',
            color: '#ffffff',
          }}
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            <span>Prometric Section Review Screen</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Review Screen"
            className="p-1 hover:bg-red-600 rounded text-slate-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Summary Banner */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-300">Total Questions:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{total}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Answered:</span>
            </div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {answeredCount}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Flag className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Flagged for Review:</span>
            </div>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
              {flaggedCount}
            </span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded font-medium border transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              All Questions ({total})
            </button>
            <button
              onClick={() => setFilter('incomplete')}
              className={`px-3 py-1.5 rounded font-medium border transition-colors flex items-center gap-1.5 ${
                filter === 'incomplete'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Unanswered ({unansweredCount})</span>
            </button>
            <button
              onClick={() => setFilter('flagged')}
              className={`px-3 py-1.5 rounded font-medium border transition-colors flex items-center gap-1.5 ${
                filter === 'flagged'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Flagged ({flaggedCount})</span>
            </button>
          </div>
          <span className="text-slate-500 text-[11px]">
            Click any row to jump directly to that question
          </span>
        </div>

        {/* Question Review Grid / Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase">
                <th className="py-2 px-3">Q#</th>
                <th className="py-2 px-3">Domain & Topic</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-center">Answer</th>
                <th className="py-2 px-3 text-center">Flagged</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredQuestions.map((item) => {
                const isCurrent = item.index === currentIndex;
                return (
                  <tr
                    key={item.question.id}
                    onClick={() => {
                      onSelectQuestion(item.index);
                      onClose();
                    }}
                    className={`cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-slate-800/80 ${
                      isCurrent ? 'bg-sky-50 dark:bg-slate-800 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                      Question {item.index + 1}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {item.question.domain}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.question.subtopic}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.isAnswered ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Complete</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                          <AlertCircle className="w-3 h-3" />
                          <span>Incomplete</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold">
                      {item.selectedOption ? (
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-800 dark:text-slate-200">
                          {item.selectedOption}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.isFlagged ? (
                        <Flag className="w-4 h-4 mx-auto fill-amber-500 text-amber-500" />
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuestion(item.index);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 rounded border border-slate-300 dark:border-slate-700 transition-colors"
                      >
                        Go to Q{item.index + 1}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No questions found under the selected filter.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-medium border border-slate-300 dark:border-slate-700"
          >
            Return to Exam
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onEndExam();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium shadow-xs"
            >
              End Exam & View Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
