import React from 'react';
import { Sparkles, FlaskConical, MessageSquare, ShieldAlert, Cpu, BookOpen, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function LandingPage({ onStartChat, onOpenUpload, docCount, chunkCount, isOllamaOnline, onSelectPrompt }) {
  const promptSuggestions = [
    "How do I purify water?",
    "How do I make soap?",
    "How do I build a shelter?",
    "I have wood, rocks, and vines. What should I build next?",
    "How can I produce clean drinking water?",
    "What are the first priorities after a disaster?"
  ];

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-5xl mx-auto w-full z-10 space-y-16">
        
        {/* Hero Section */}
        <div className="text-center space-y-6">


          <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white drop-shadow-md">
            Dr. <span className="text-[#34D399]">RAHM</span>
          </h1>

          <p className="text-xl sm:text-3xl font-extrabold text-emerald-100 max-w-3xl mx-auto leading-relaxed drop-shadow">
            Rebuild Civilization Using <span className="text-[#34D399] underline decoration-emerald-400">Science</span>
          </p>

          <p className="text-emerald-50 max-w-2xl mx-auto text-sm sm:text-base font-medium">
            An offline scientific survival assistant. Grounding answers strictly in authentic physics, chemistry, biology, and engineering documents.
          </p>

          {/* Action Button - Extra Wide & Prominent CTA */}
          <div className="flex items-center justify-center pt-6">
            <button
              onClick={onStartChat}
              className="w-full sm:w-auto min-w-[360px] sm:min-w-[420px] px-14 py-5 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-2xl flex items-center justify-center gap-4 shadow-2xl transform hover:scale-105 transition-all border-3 border-emerald-200/50 tracking-wide"
            >
              <MessageSquare className="w-7 h-7 fill-current shrink-0" />
              <span>Start Scientific Chat</span>
              <ArrowRight className="w-7 h-7 shrink-0" />
            </button>
          </div>

          {/* System Status Indicators */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-mono text-emerald-100">
            <div className="flex items-center gap-2 glass-panel-dark px-4 py-2 rounded-xl border border-emerald-700/50">
              <BookOpen className="w-4 h-4 text-[#34D399]" />
              <span>Knowledge Base: <strong className="text-white">{docCount} PDFs ({chunkCount} Vectors)</strong></span>
            </div>
            <div className="flex items-center gap-2 glass-panel-dark px-4 py-2 rounded-xl border border-emerald-700/50">
              <Cpu className="w-4 h-4 text-[#34D399]" />
              <span>Ollama Gemma: 
                <span className={`ml-1 font-bold ${isOllamaOnline ? 'text-[#34D399]' : 'text-amber-300'}`}>
                  {isOllamaOnline ? '● Ready (gemma2:2b)' : '○ Disconnected'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Prompt Suggestions Grid */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-700" />
              <span>Quick Survival & Science Queries</span>
            </h2>
            <span className="text-xs text-slate-700 font-mono font-semibold">Click to test instant RAG lookup</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {promptSuggestions.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(prompt)}
                className="text-left glass-panel p-4 rounded-xl glass-card-hover group border border-emerald-200 flex items-start justify-between gap-3 shadow-sm"
              >
                <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                  "{prompt}"
                </span>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Features Specs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-emerald-300/60 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Strict Document Grounding</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Zero hallucination policy. Answers are constructed strictly from retrieved vector chunks with zero external assumptions.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-emerald-300/60 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">FAISS + SentenceTransformers</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Fast, offline embedding vector index using all-MiniLM-L6-v2 for sub-millisecond semantic chunk retrieval.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 border border-emerald-300/60 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Formatted Lab Reports</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Outputs strictly structured scientific procedures with materials, step-by-step instructions, safety hazards, and citations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
