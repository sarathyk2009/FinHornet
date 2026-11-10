import React, { useState } from 'react';
import { X, BookOpen, Search, Copy, Check } from 'lucide-react';
import { CMA_FORMULA_SHEET } from '../data/cmaFormulas';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const FormulaExhibitModal: React.FC<Props> = ({ isOpen, onClose, isDark }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSections = CMA_FORMULA_SHEET.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
  })).filter((section) => section.items.length > 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedFormula(text);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-label="CMA Formula Sheet and Reference Exhibits"
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] rounded-lg shadow-2xl border flex flex-col overflow-hidden"
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
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Official Exam Exhibit: CMA Quick Formulas & Reference Sheet</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Exhibit"
            className="p-1 hover:bg-red-600 rounded text-slate-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search formulas by name (e.g., 'Variance', 'WACC', 'Breakeven', 'DuPont')..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded border outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Body content */}
        <div className="p-4 overflow-y-auto space-y-6 text-xs flex-1">
          {filteredSections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="font-bold text-sm text-sky-700 dark:text-sky-400 uppercase tracking-wider border-b pb-1 border-slate-200 dark:border-slate-700">
                {sec.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sec.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="p-3 rounded border transition-colors bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        <span>{item.name}</span>
                        <button
                          onClick={() => copyToClipboard(item.formula)}
                          title="Copy formula"
                          className="text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 p-1"
                        >
                          {copiedFormula === item.formula ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="font-mono text-xs bg-slate-50 dark:bg-slate-900 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-bold mb-1">
                        {item.formula}
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              No formulas match "{searchTerm}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t bg-slate-100 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">IMA Examination Reference Guidelines</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded font-medium"
          >
            Close Exhibit
          </button>
        </div>
      </div>
    </div>
  );
};
