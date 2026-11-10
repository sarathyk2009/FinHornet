import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Zap,
  HelpCircle,
  BrainCircuit,
  Calculator,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { ActiveQuestionContext } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

interface Props {
  isDark?: boolean;
  activeQuestionContext?: ActiveQuestionContext | null;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

const DEFAULT_QUICK_PROMPTS = [
  { label: '⚡ Variances Formula', text: 'Explain direct material and direct labor variances with an easy-to-remember formula framework.' },
  { label: '📊 Absorption vs Variable', text: 'What is the exact difference between absorption costing and variable costing for US CMA Part 1?' },
  { label: '🎯 1-Minute CMA Drill', text: 'Give me a challenging multiple-choice question on CMA Part 1 Planning & Budgeting with 4 options.' },
  { label: '🐝 Conquering Exam Nerve', text: 'How should I manage my pacing and nerve during the 4-hour Prometric CMA exam?' },
];

export const FinHornetGeminiChatbot: React.FC<Props> = ({
  isDark = false,
  activeQuestionContext,
  isOpenExternal,
  onCloseExternal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync external open request
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
      if (isOpenExternal) setIsMinimized(false);
    }
  }, [isOpenExternal]);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        content: `**Welcome to FinHornet AI!** 🐝\n\nI am your dedicated **US CMA Exam Mentor** — built for *"Where Numbers Meet Nerve"*.\n\nWhenever you view any question on the platform, I automatically synchronize with its scenario, data exhibits, answer choices, and official step-by-step mathematical solutions.\n\n*What topic or calculation shall we conquer today?*`,
        timestamp: Date.now(),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputMessage).trim();
    if (!prompt || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation payload for the backend server
      const payloadMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: payloadMessages,
          model: selectedModel,
          // Automatically pass the active question's full text, options, correct answer, and step-by-step explanation
          questionContext: activeQuestionContext || undefined,
          context: activeQuestionContext || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const modelReply = data.reply || "I couldn't generate an answer right now. Please try again.";

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: modelReply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Failed to get Gemini response:', err);
      // Graceful fallback
      const fallbackMsg: ChatMessage = {
        id: `model-err-${Date.now()}`,
        role: 'model',
        content: `**FinHornet Study Note**: \n\nRemember: In standard costing, **Price Variance** = $(AP - SP) \\times AQ$ and **Efficiency Variance** = $(AQ - SQ) \\times SP$. \n\n*Network or API offline. You can continue asking questions anytime!*`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'model',
        content: `Conversation refreshed! What CMA concept, formula, or exhibit would you like to review?`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render markdown-like simple formatting (bold, italics, lists, code)
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={i} className="text-sm font-bold text-amber-500 dark:text-amber-400 mt-2 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-2 mb-1">{line.replace('## ', '')}</h3>;
      }
      // Bullet items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={i} className="ml-4 list-disc text-xs sm:text-sm text-slate-700 dark:text-slate-300 my-0.5 leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInline(line.substring(2)) }} />
          </li>
        );
      }
      // Empty line spacer
      if (!line.trim()) {
        return <div key={i} className="h-1.5" />;
      }
      // Standard paragraph
      return (
        <p key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-0.5">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  // Simple safe inline bold / code formatter
  const formatInline = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-amber-600 dark:text-amber-400">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded text-[11px] font-mono border border-amber-300/40">$1</code>');
  };

  return (
    <>
      {/* Floating Toggle Button (Lower Right Corner) */}
      {!isOpen && (
        <div className="group fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-900/90 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md border border-amber-400/40 opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>FinHornet AI • Ask CMA Tutor</span>
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 border-2 border-slate-950 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-hidden"
            aria-label="Open FinHornet AI Chatbot"
            title="Ask FinHornet AI - Where Numbers Meet Nerve"
          >
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-10-26_at_1.37.51_AM_bdac2704.jpeg"
              alt="FinHornet"
              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-950/20"
            />
            {/* Online Pulse Dot */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          </button>
        </div>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ease-in-out shadow-2xl flex flex-col ${
            isMinimized
              ? 'bottom-6 right-6 w-72 h-14 rounded-2xl overflow-hidden'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] max-w-[430px] h-[580px] max-h-[85vh] rounded-3xl overflow-hidden border border-amber-400/30'
          }`}
          style={{
            backgroundColor: isDark ? '#0b1120' : '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.25)',
          }}
        >
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white px-4 py-3 flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-10-26_at_1.37.51_AM_bdac2704.jpeg"
                alt="FinHornet Logo"
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-amber-400/60"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight text-white flex items-center gap-1">
                    Fin<span className="text-amber-400">Hornet</span> AI
                  </h3>
                  <span className="text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1 rounded">
                    {selectedModel.replace('gemini-', '')}
                  </span>
                </div>
                <p className="text-[10px] text-amber-200/80 font-medium">Where Numbers Meet Nerve</p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Model Selector Bar */}
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                  <BrainCircuit className="w-3.5 h-3.5 text-amber-500" />
                  <span>Model:</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedModel('gemini-3.8-flash')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      selectedModel === 'gemini-3.8-flash'
                        ? 'bg-amber-400 text-slate-950 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    3.8 Flash (General)
                  </button>
                  <button
                    onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      selectedModel === 'gemini-3.1-flash-lite'
                        ? 'bg-amber-400 text-slate-950 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    3.1 Lite (Fast)
                  </button>
                  <button
                    onClick={() => setSelectedModel('gemini-4-argon')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      selectedModel === 'gemini-4-argon'
                        ? 'bg-amber-400 text-slate-950 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    4 Argon (Deep)
                  </button>
                </div>
              </div>

              {/* Active Question Synchronization Banner */}
              {activeQuestionContext && (
                <div className="px-3 py-1.5 bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-400/25 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    <span className="font-semibold text-amber-950 dark:text-amber-200 truncate text-[11px]">
                      Active Question: <strong className="font-bold">{activeQuestionContext.domain || 'CMA Practice'}</strong>
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30 shrink-0">
                    Auto-Linked
                  </span>
                </div>
              )}

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
                {messages.map((m) => {
                  const isUser = m.role === 'user';
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs ring-1 ring-amber-500/30">
                          🐝
                        </div>
                      )}

                      <div
                        className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                          isUser
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-tr-xs'
                            : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-tl-xs'
                        }`}
                      >
                        {/* Copy Button */}
                        {!isUser && (
                          <button
                            onClick={() => handleCopy(m.id, m.content)}
                            title="Copy response"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-amber-500"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}

                        <div className="space-y-1">
                          {renderFormattedContent(m.content)}
                        </div>

                        <span
                          className={`text-[9px] mt-1.5 block opacity-60 text-right ${
                            isUser ? 'text-slate-900' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {isUser && (
                        <div className="shrink-0 w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs ring-1 ring-slate-800">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading / Thinking Indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 justify-start items-center">
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                      🐝
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800/90 border border-amber-400/30 rounded-2xl rounded-tl-xs px-4 py-2.5 flex items-center gap-2">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold italic">
                        FinHornet is analyzing...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              {messages.length <= 3 && !isLoading && (
                <div className="px-3 pb-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{activeQuestionContext ? 'Active Question Prompts' : 'Quick Drill Topics'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeQuestionContext
                      ? [
                          { label: '🧮 Step-by-Step Math', text: 'Break down the mathematical calculation and formulas step-by-step for this question.' },
                          { label: `✅ Why Option ${activeQuestionContext.correctOption} is Correct`, text: `Explain why Option ${activeQuestionContext.correctOption} is the correct answer according to official solution.` },
                          { label: '❌ Distractor Traps', text: 'Explain why the other answer choices are incorrect and what common traps they present.' },
                          { label: '💡 Key Concept / Formula', text: 'What is the core accounting or financial principle I must remember for this scenario?' },
                        ]
                      : DEFAULT_QUICK_PROMPTS
                    ).map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(qp.text)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300/40 font-medium transition-colors text-left"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Control Box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
                <div className="relative flex items-end gap-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition-all shadow-inner">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask FinHornet about formulas, variances, or pacing..."
                    disabled={isLoading}
                    className="flex-1 max-h-24 resize-none bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden py-1 px-1"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="shrink-0 p-2 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold shadow-2xs"
                    title="Send to FinHornet AI"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400 dark:text-slate-500">
                  <span>Press <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded text-slate-700 dark:text-slate-300">Enter</kbd> to send</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <Zap className="w-3 h-3" /> Powered by Gemini
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
