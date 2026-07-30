import React, { useState, useRef, useEffect } from 'react';
import { Send, FlaskConical, BookOpen, Copy, Check, Sparkles, ChevronDown, ChevronUp, FileText, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

export default function ChatInterface({ onOpenUpload, docCount, initialPrompt }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `🧪 **Dr. RAHM Active**

I am your scientific survival assistant. Ask any question regarding survival chemistry, primitive medicine, physics, biology, or civil engineering.

All answers are derived strictly from our indexed scientific PDFs and datasets with verified references.`,
      citations: []
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedCitations, setExpandedCitations] = useState({});

  const messagesEndRef = useRef(null);

  const promptSuggestions = [
    "How do I purify water?",
    "How do I make soap?",
    "How do I build a shelter?",
    "I have wood, rocks, and vines. What should I build next?",
    "How can I produce clean drinking water?",
    "What are the first priorities after a disaster?"
  ];

  const loadingMessages = [
    "⚗ Running Scientific Analysis...",
    "Searching Knowledge Base...",
    "Synthesizing Scientific Response..."
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, loadingStage]);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query || !query.strip?.() && !query.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      citations: []
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);
    setLoadingStage(0);

    const stageInterval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % loadingMessages.length);
    }, 1200);

    try {
      const res = await axios.post('http://localhost:8000/query', {
        question: query
      });

      clearInterval(stageInterval);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.data.answer || "I couldn't find this information in the current scientific knowledge base.",
        citations: res.data.citations || []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      clearInterval(stageInterval);
      console.error(err);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: err.response?.data?.detail || "Gemma is not running. Please start Ollama.",
        citations: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleCitation = (msgId) => {
    setExpandedCitations(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto w-full p-2 sm:p-4">
      
      {/* Quick Prompt Bar Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 px-1 no-scrollbar border-b border-emerald-300/40 shrink-0">
        <span className="text-xs text-white font-mono flex items-center gap-1 shrink-0 font-black drop-shadow">
          <Zap className="w-3.5 h-3.5 text-white" />
          <span>Prompts:</span>
        </span>
        {promptSuggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg glass-panel hover:bg-emerald-600 hover:text-white text-slate-900 text-xs whitespace-nowrap transition-colors border border-emerald-300 font-semibold disabled:opacity-50 shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 px-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            {/* Header Tag above message card */}
            <div className="flex items-center gap-2 text-xs font-mono px-1">
              {msg.sender === 'assistant' ? (
                <>
                  <FlaskConical className="w-4 h-4 text-[#042F2E]" />
                  <span className="text-[#042F2E] font-black text-sm drop-shadow-sm">Dr. RAHM</span>
                </>
              ) : (
                <span className="text-slate-800 font-bold">You</span>
              )}
            </div>

            {/* Message Box Card */}
            <div
              className={`relative max-w-3xl rounded-2xl p-5 shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-white text-black font-semibold rounded-tr-none border-2 border-emerald-400 shadow-md'
                  : 'glass-panel text-slate-900 border-2 border-emerald-300/60 rounded-tl-none space-y-4'
              }`}
            >
              {/* Copy Button */}
              {msg.sender === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(msg.text, msg.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-700 hover:text-black hover:bg-slate-200/80 transition-colors border border-slate-300"
                  title="Copy Report"
                >
                  {copiedId === msg.id ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                </button>
              )}

              {/* Message Content */}
              <div className={`prose prose-emerald max-w-none text-sm leading-relaxed font-semibold ${msg.sender === 'user' ? 'text-black' : 'text-slate-900'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {/* Citations Drawer */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-3 border-t border-slate-300 space-y-2">
                  <button
                    onClick={() => toggleCitation(msg.id)}
                    className="flex items-center justify-between w-full text-xs font-mono text-[#042F2E] font-black bg-emerald-100 hover:bg-emerald-200 p-2.5 rounded-xl border-2 border-emerald-400 shadow-sm transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-800" />
                      <span>Retrieved Sources ({msg.citations.length} Citations)</span>
                    </span>
                    {expandedCitations[msg.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {expandedCitations[msg.id] && (
                    <div className="space-y-2 pt-2">
                      {msg.citations.map((cit, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-slate-300 text-xs space-y-1.5 shadow-sm">
                          <div className="flex items-center justify-between text-slate-900 font-mono">
                            <span className="flex items-center gap-1.5 text-[#042F2E] font-black">
                              <FileText className="w-3.5 h-3.5 text-emerald-700" />
                              {cit.source}
                            </span>
                            <span className="text-slate-800 bg-slate-200 font-bold px-2 py-0.5 rounded text-[10px]">
                              Page {cit.page}
                            </span>
                          </div>
                          <p className="text-slate-800 text-xs italic bg-slate-50 p-2 rounded border border-slate-200 font-sans font-medium">
                            "{cit.excerpt}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <FlaskConical className="w-4 h-4 text-[#042F2E] animate-spin" />
              <span className="text-[#042F2E] font-black text-sm">Dr. RAHM</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl rounded-tl-none border-2 border-emerald-400 flex items-center gap-3 shadow-lg">
              <div className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
              <span className="text-sm font-mono text-[#042F2E] font-black animate-pulse">
                {loadingMessages[loadingStage]}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 pt-2 pb-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="glass-panel p-2 rounded-2xl border-2 border-emerald-400 flex items-center gap-2 shadow-2xl focus-within:border-emerald-600 transition-all bg-white"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask scientific survival question (e.g. How do I synthesize nitric acid?)..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-black font-semibold text-sm px-4 py-2 placeholder-slate-500 font-sans"
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
}
