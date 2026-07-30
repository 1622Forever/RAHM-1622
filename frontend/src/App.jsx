import React, { useState, useEffect } from 'react';
import { FlaskConical, MessageSquare, Upload, Home, Hammer, BookOpen, Cpu, Sparkles } from 'lucide-react';
import axios from 'axios';

import LandingPage from './components/LandingPage';
import ChatInterface from './components/ChatInterface';
import ResourcePlanner from './components/ResourcePlanner';
import PdfUploadModal from './components/PdfUploadModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing'); // landing, chat, planner
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docList, setDocList] = useState([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isOllamaOnline, setIsOllamaOnline] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState(null);

  const fetchHealthAndDocs = async () => {
    try {
      const healthRes = await axios.get('http://localhost:8000/health');
      setIsOllamaOnline(healthRes.data.ollama_connected);

      const docsRes = await axios.get('http://localhost:8000/documents');
      setDocList(docsRes.data.documents || []);
      setTotalChunks(docsRes.data.total_chunks || 0);
    } catch (err) {
      console.warn('Backend server on port 8000:', err);
      setIsOllamaOnline(false);
    }
  };

  useEffect(() => {
    fetchHealthAndDocs();
    const interval = setInterval(fetchHealthAndDocs, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPrompt = (promptText) => {
    setInitialPrompt(promptText);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans selection:bg-[#10B981] selection:text-white">
      
      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 w-full glass-panel-dark border-b border-[#10B981]/30 backdrop-blur-xl shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Title */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#10B981] via-[#059669] to-[#FDFBF7] p-0.5 shadow-leaf-glow group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#042F2E] rounded-[10px] flex items-center justify-center text-[#10B981]">
                <FlaskConical className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white group-hover:text-[#34D399] transition-colors">
                  Dr. <span className="text-[#34D399]">RAHM</span>
                </h1>
              </div>
              <p className="text-xs text-emerald-200 font-medium">Rebuild Civilization Using Science</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            <nav className="flex items-center gap-1 bg-[#064E3B]/80 p-1.5 rounded-xl border border-emerald-700/50">
              <button
                onClick={() => setActiveTab('landing')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'landing'
                    ? 'bg-[#10B981] text-slate-950 shadow-md'
                    : 'text-emerald-100 hover:text-white hover:bg-[#047857]/50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Landing</span>
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-[#10B981] text-slate-950 shadow-md'
                    : 'text-emerald-100 hover:text-white hover:bg-[#047857]/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Scientific Chat</span>
              </button>

              <button
                onClick={() => setActiveTab('planner')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'planner'
                    ? 'bg-[#10B981] text-slate-950 shadow-md'
                    : 'text-emerald-100 hover:text-white hover:bg-[#047857]/50'
                }`}
              >
                <Hammer className="w-4 h-4" />
                <span className="hidden sm:inline">Resource Planner</span>
              </button>
            </nav>

            {/* Upload PDF Button */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white border border-emerald-400/40 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all transform hover:scale-105 shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">Upload PDF</span>
            </button>

          </div>

        </div>
      </header>

      {/* View Switcher */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onStartChat={() => setActiveTab('chat')}
            onOpenUpload={() => setIsUploadOpen(true)}
            docCount={docList.length}
            chunkCount={totalChunks}
            isOllamaOnline={isOllamaOnline}
            onSelectPrompt={handleSelectPrompt}
          />
        )}
        
        {activeTab === 'chat' && (
          <ChatInterface
            onOpenUpload={() => setIsUploadOpen(true)}
            docCount={docList.length}
            initialPrompt={initialPrompt}
          />
        )}

        {activeTab === 'planner' && (
          <ResourcePlanner
            onOpenUpload={() => setIsUploadOpen(true)}
            docCount={docList.length}
          />
        )}
      </main>

      {/* PDF Upload Modal */}
      <PdfUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => fetchHealthAndDocs()}
        docList={docList}
        totalChunks={totalChunks}
      />

    </div>
  );
}
