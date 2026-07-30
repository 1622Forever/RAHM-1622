import React, { useState } from 'react';
import { Hammer, Plus, X, Sparkles, Loader2, BookOpen, AlertCircle, FileText, CheckCircle2, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

export default function ResourcePlanner({ onOpenUpload, docCount }) {
  const [resources, setResources] = useState(['Wood', 'Stone', 'Water', 'Clay']);
  const [customInput, setCustomInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedCitations, setExpandedCitations] = useState(true);

  const presetMaterials = ['Wood', 'Stone', 'Water', 'Clay', 'Vines', 'Charcoal', 'Seashells', 'Hardwood', 'Iron Ore', 'Wood Ash'];

  const handleAddResource = (itemToAdd) => {
    const item = itemToAdd || customInput;
    if (!item || !item.trim()) return;
    const cleanItem = item.trim();
    if (!resources.includes(cleanItem)) {
      setResources(prev => [...prev, cleanItem]);
    }
    if (!itemToAdd) setCustomInput('');
  };

  const handleRemoveResource = (itemToRemove) => {
    setResources(prev => prev.filter(r => r !== itemToRemove));
  };

  const handleGeneratePlan = async () => {
    if (resources.length === 0) {
      setErrorMessage('Please add at least one available resource.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);
    setPlanResult(null);

    try {
      const res = await axios.post('http://localhost:8000/plan', {
        resources: resources
      });
      setPlanResult(res.data);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.detail || 'Failed to generate scientific resource plan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto w-full p-4 overflow-y-auto space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel bg-white/90 p-6 rounded-2xl border-2 border-emerald-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              Scientific Resource Planner
            </h2>
            <p className="text-xs font-bold text-emerald-950">Enter available raw materials to discover buildable survival projects & recipes</p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 font-bold">
          Knowledge Base: <strong className="text-emerald-900">{docCount} Documents Active</strong>
        </div>
      </div>

      {/* Inventory & Presets Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Available Materials Box */}
        <div className="md:col-span-2 glass-panel bg-white/90 p-6 rounded-2xl border-2 border-emerald-300 space-y-4 shadow-lg">
          <label className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>Active Resource Inventory</span>
          </label>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-2 min-h-[60px] p-3 rounded-xl bg-slate-50 border-2 border-slate-300 items-center">
            {resources.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-400 text-[#042F2E] text-xs font-mono font-black animate-fadeIn shadow-sm"
              >
                {item}
                <button
                  onClick={() => handleRemoveResource(item)}
                  className="hover:text-red-600 p-0.5 rounded transition-colors text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {resources.length === 0 && (
              <span className="text-xs text-slate-500 font-mono italic font-semibold">No materials selected yet. Click preset chips below to add.</span>
            )}
          </div>

          {/* Manual Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleAddResource(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Add custom material (e.g. Copper, Charcoal, Lye)..."
              className="flex-1 bg-white border-2 border-slate-300 rounded-xl px-4 py-2 text-xs text-black font-bold outline-none focus:border-emerald-600 placeholder-slate-500 shadow-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#042F2E] hover:bg-black text-emerald-300 font-black text-xs flex items-center gap-1 transition-colors border border-emerald-500 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Quick Presets */}
        <div className="glass-panel bg-white/90 p-6 rounded-2xl border-2 border-emerald-300 space-y-3 shadow-lg">
          <span className="text-xs font-black text-slate-900 font-mono">QUICK PRESET MATERIALS</span>
          <div className="flex flex-wrap gap-1.5">
            {presetMaterials.map((preset, i) => (
              <button
                key={i}
                onClick={() => handleAddResource(preset)}
                disabled={resources.includes(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  resources.includes(preset)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-emerald-50 text-slate-900 hover:bg-emerald-200 hover:text-emerald-950 border border-emerald-300 shadow-sm'
                }`}
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Action Button */}
      <button
        onClick={handleGeneratePlan}
        disabled={isLoading || resources.length === 0}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-emerald-400"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>⚗ Analyzing Material Chemistry & Construction Recipes...</span>
          </>
        ) : (
          <>
            <Hammer className="w-6 h-6" />
            <span>Generate Scientific Resource Plan</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-100 border-2 border-red-400 text-red-900 text-xs flex items-center gap-2 font-bold shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Plan Results Report Card */}
      {planResult && (
        <div className="glass-panel bg-white p-6 sm:p-8 rounded-2xl border-2 border-emerald-400 space-y-6 shadow-2xl animate-fadeIn">
          
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Scientific Resource Analysis Report</span>
            </h3>
            <span className="text-xs font-mono text-emerald-950 font-bold bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-300">
              Gemma Grounded Output
            </span>
          </div>

          <div className="prose prose-emerald max-w-none text-sm leading-relaxed text-slate-900 font-medium">
            <ReactMarkdown>{planResult.answer}</ReactMarkdown>
          </div>

          {/* Citations */}
          {planResult.citations && planResult.citations.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <button
                onClick={() => setExpandedCitations(!expandedCitations)}
                className="flex items-center justify-between w-full text-xs font-mono text-[#042F2E] font-black bg-emerald-100 hover:bg-emerald-200 p-3 rounded-xl border-2 border-emerald-400 shadow-sm transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                  <span>Scientific References ({planResult.citations.length} Document Sources)</span>
                </span>
                {expandedCitations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedCitations && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {planResult.citations.map((cit, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between font-mono text-slate-900">
                        <span className="text-[#042F2E] font-black flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-emerald-700" />
                          {cit.source}
                        </span>
                        <span className="text-slate-800 bg-slate-200 font-bold px-2 py-0.5 rounded text-[10px]">
                          Page {cit.page}
                        </span>
                      </div>
                      <p className="text-slate-800 text-xs italic bg-white p-2 rounded border border-slate-200 font-sans font-medium">
                        "{cit.excerpt}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
