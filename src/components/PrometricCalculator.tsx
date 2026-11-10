import React, { useState } from 'react';
import { X, Minus, Calculator as CalcIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const PrometricCalculator: React.FC<Props> = ({ isOpen, onClose, isDark }) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (resetNext) {
      setDisplay(digit);
      setResetNext(false);
    } else {
      if (display === '0' && digit !== '.') {
        setDisplay(digit);
      } else if (digit === '.' && display.includes('.')) {
        return;
      } else {
        setDisplay(display.length < 14 ? display + digit : display);
      }
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setResetNext(false);
  };

  const handleBackspace = () => {
    if (display.length <= 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleOp = (op: string) => {
    const current = parseFloat(display);
    if (prevValue !== null && operation && !resetNext) {
      const computed = compute(prevValue, current, operation);
      setPrevValue(computed);
      setDisplay(String(computed));
    } else {
      setPrevValue(current);
    }
    setOperation(op);
    setResetNext(true);
  };

  const compute = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b;
      case '−':
      case '-':
        return a - b;
      case '×':
      case '*':
        return a * b;
      case '÷':
      case '/':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    if (prevValue !== null && operation) {
      const current = parseFloat(display);
      const computed = compute(prevValue, current, operation);
      setDisplay(String(Number(computed.toFixed(8))));
      setPrevValue(null);
      setOperation(null);
      setResetNext(true);
    }
  };

  const handleSqrt = () => {
    const val = parseFloat(display);
    if (val >= 0) {
      setDisplay(String(Number(Math.sqrt(val).toFixed(8))));
      setResetNext(true);
    }
  };

  const handleReciprocal = () => {
    const val = parseFloat(display);
    if (val !== 0) {
      setDisplay(String(Number((1 / val).toFixed(8))));
      setResetNext(true);
    }
  };

  const handlePercent = () => {
    const val = parseFloat(display);
    setDisplay(String(val / 100));
    setResetNext(true);
  };

  const handleNegate = () => {
    const val = parseFloat(display);
    setDisplay(String(-val));
  };

  // Memory functions
  const handleMemory = (type: 'MC' | 'MR' | 'MS' | 'M+' | 'M-') => {
    const current = parseFloat(display);
    if (type === 'MC') setMemory(0);
    if (type === 'MR') {
      setDisplay(String(memory));
      setResetNext(true);
    }
    if (type === 'MS') {
      setMemory(current);
      setResetNext(true);
    }
    if (type === 'M+') setMemory(memory + current);
    if (type === 'M-') setMemory(memory - current);
  };

  return (
    <div
      className="fixed z-50 bottom-12 right-8 w-80 rounded-lg shadow-2xl border transition-all animate-in fade-in"
      style={{
        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
        borderColor: isDark ? '#334155' : '#cbd5e1',
      }}
      role="dialog"
      aria-label="Prometric Exam Calculator"
    >
      {/* Prometric Window Header */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-t-lg select-none cursor-move text-xs font-semibold"
        style={{
          backgroundColor: isDark ? '#0f172a' : '#1e3a5f',
          color: '#ffffff',
        }}
      >
        <div className="flex items-center gap-1.5">
          <CalcIcon className="w-4 h-4 text-sky-300" />
          <span>Prometric Standard Financial Calculator</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            aria-label="Close Calculator"
            className="p-1 hover:bg-red-600 rounded text-slate-200 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3">
        {/* LCD Display */}
        <div
          className="mb-3 px-3 py-2 rounded border text-right font-mono text-2xl font-bold tracking-wider overflow-x-auto shadow-inner"
          style={{
            backgroundColor: isDark ? '#020617' : '#e2e8f0',
            borderColor: isDark ? '#334155' : '#94a3b8',
            color: isDark ? '#38bdf8' : '#0f172a',
          }}
        >
          <div className="text-[10px] text-slate-500 font-sans uppercase flex justify-between">
            <span>{memory !== 0 ? 'M' : ''}</span>
            <span>{operation ? `${prevValue} ${operation}` : ''}</span>
          </div>
          <span>{display}</span>
        </div>

        {/* Memory Row */}
        <div className="grid grid-cols-5 gap-1 mb-2 text-xs font-medium">
          {(['MC', 'MR', 'MS', 'M+', 'M-'] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleMemory(m)}
              className="py-1 rounded border text-center transition-colors hover:brightness-95 active:scale-95 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-mono text-xs"
            >
              {m}
            </button>
          ))}
        </div>

        {/* Function Keys & Numbers Grid */}
        <div className="grid grid-cols-4 gap-1.5 text-sm font-semibold">
          <button
            onClick={handleClear}
            className="py-2 rounded bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="py-2 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
          >
            ←
          </button>
          <button
            onClick={handleSqrt}
            className="py-2 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
          >
            √
          </button>
          <button
            onClick={() => handleOp('÷')}
            className="py-2 rounded bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700"
          >
            ÷
          </button>

          <button
            onClick={() => handleDigit('7')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            9
          </button>
          <button
            onClick={() => handleOp('×')}
            className="py-2 rounded bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700"
          >
            ×
          </button>

          <button
            onClick={() => handleDigit('4')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            6
          </button>
          <button
            onClick={() => handleOp('−')}
            className="py-2 rounded bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700"
          >
            −
          </button>

          <button
            onClick={() => handleDigit('1')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            3
          </button>
          <button
            onClick={() => handleOp('+')}
            className="py-2 rounded bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700"
          >
            +
          </button>

          <button
            onClick={handleNegate}
            className="py-2 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
          >
            ±
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('.')}
            className="py-2 rounded bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold border border-blue-700 shadow-sm"
          >
            =
          </button>
        </div>

        {/* Bottom row: reciprocal and percent */}
        <div className="grid grid-cols-2 gap-1.5 mt-1.5 text-xs">
          <button
            onClick={handleReciprocal}
            className="py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
          >
            1 / x
          </button>
          <button
            onClick={handlePercent}
            className="py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
          >
            %
          </button>
        </div>
      </div>
    </div>
  );
};
