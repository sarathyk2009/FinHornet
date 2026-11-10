import React from 'react';
import { X, FileText, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
  notes: string;
  onNotesChange: (text: string) => void;
  questionNumber: number;
}

export const PrometricScratchpad: React.FC<Props> = ({
  isOpen,
  onClose,
  isDark,
  notes,
  onNotesChange,
  questionNumber,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50 bottom-12 left-8 w-96 rounded-lg shadow-2xl border transition-all animate-in fade-in"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
        borderColor: isDark ? '#334155' : '#cbd5e1',
      }}
      role="dialog"
      aria-label="Candidate Scratchpad"
    >
      <div
        className="flex items-center justify-between px-3 py-2 rounded-t-lg select-none text-xs font-semibold"
        style={{
          backgroundColor: isDark ? '#0f172a' : '#1e3a5f',
          color: '#ffffff',
        }}
      >
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span>Prometric Candidate Scratchpad (Q{questionNumber})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNotesChange('')}
            title="Clear notes"
            className="p-1 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            aria-label="Close Scratchpad"
            className="p-1 hover:bg-red-600 rounded text-slate-200 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
          Jot down T-accounts, calculation variables, or notes. Saved locally for this session.
        </p>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="E.g.,&#10;Units = 50,000&#10;Fixed MOH/unit = $1,000,000 / 50k = $20&#10;Absorption diff = 10,000 × $20 = $200k..."
          className="w-full h-56 p-2.5 rounded border font-mono text-xs leading-relaxed outline-none resize-none focus:ring-1 focus:ring-sky-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100"
        />
      </div>
    </div>
  );
};
