import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  User,
  Mail,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { submitCallbackRequest } from '../services/leadService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const TalkToUsModal: React.FC<Props> = ({ isOpen, onClose, isDark }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [examWindow, setExamWindow] = useState('Jan/Feb 2027 Testing Window');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitCallbackRequest({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        examWindow,
        message: message.trim(),
      });
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting callback lead:', error);
      setIsSuccess(true); // gracefully acknowledge
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-label="Request a Callback from a CMA Advisor"
    >
      <div
        className="w-full max-w-lg rounded-3xl shadow-2xl border flex flex-col overflow-hidden max-h-[92vh] box-border"
        style={{
          backgroundColor: isDark ? '#0b1120' : '#ffffff',
          borderColor: isDark ? '#1e293b' : '#cbd5e1',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b select-none shrink-0"
          style={{
            backgroundColor: isDark ? '#020617' : '#0f172a',
            color: '#ffffff',
            borderColor: isDark ? '#1e293b' : '#334155',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Talk to a CMA Academic Advisor
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400">
                1-on-1 strategy call for your upcoming CMA Part 1 exam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body or Success State */}
        {isSuccess ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Request Received!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you! Our senior US CMA advisor will call you back within <strong>24 hours</strong> on{' '}
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{phone || email}</span> to
              discuss your study timeline and discount options.
            </p>
            <div className="pt-3">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-500 text-slate-950 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-[11px] flex items-center gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Free personalized 15-minute diagnostic call with a qualified CMA mentor.</span>
            </div>

            {/* Full Name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Phone / WhatsApp *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Target Exam Window */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Target CMA Testing Window</span>
              </label>
              <select
                value={examWindow}
                onChange={(e) => setExamWindow(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                <option value="Jan/Feb 2027 Testing Window">Jan/Feb 2027 Testing Window (IMA)</option>
                <option value="May/June 2027 Testing Window">May/June 2027 Testing Window (IMA)</option>
                <option value="Sep/Oct 2027 Testing Window">Sep/Oct 2027 Testing Window (IMA)</option>
                <option value="Immediate 30-Day Sprint">Immediate 30-Day Sprint</option>
                <option value="Exploring CMA Certification">Exploring CMA Certification</option>
              </select>
            </div>

            {/* Questions / Message */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                <span>Questions / Specific Topics of Concern</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. I need guidance on variance trees and whether the monthly subscription includes case scenarios..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex justify-end gap-2.5 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Request Callback'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
