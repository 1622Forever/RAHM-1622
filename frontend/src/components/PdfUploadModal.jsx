import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle, Database, Layers } from 'lucide-react';
import axios from 'axios';

export default function PdfUploadModal({ isOpen, onClose, onUploadSuccess, docList, totalChunks }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, extracting, embedding, updating, completed, error
  const [errorMessage, setErrorMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  if (!isOpen) return null;

  const handleFileSelect = (file) => {
    const validExts = ['.pdf', '.tsv', '.csv', '.txt', '.md'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (file && validExts.includes(ext)) {
      setSelectedFile(file);
      setErrorMessage('');
    } else {
      setErrorMessage('Please select a valid PDF, TSV, CSV, or TXT document.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState('uploading');
    setProgressPercent(15);

    try {
      setTimeout(() => {
        setUploadState('extracting');
        setProgressPercent(40);
      }, 600);

      setTimeout(() => {
        setUploadState('embedding');
        setProgressPercent(70);
      }, 1400);

      setTimeout(() => {
        setUploadState('updating');
        setProgressPercent(90);
      }, 2200);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadState('completed');
      setProgressPercent(100);
      onUploadSuccess(res.data);

      setTimeout(() => {
        setSelectedFile(null);
        setUploadState('idle');
        setProgressPercent(0);
      }, 2500);

    } catch (err) {
      console.error(err);
      setUploadState('error');
      setErrorMessage(err.response?.data?.detail || 'Failed to upload and index document.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      
      {/* Black Border Window with FBFFF1 to Leaf-Green Slow Blend */}
      <div 
        className="relative w-full max-w-2xl rounded-2xl border-4 border-black shadow-[0_15px_60px_rgba(0,0,0,0.6)] overflow-hidden space-y-6 p-6 sm:p-8"
        style={{
          background: 'linear-gradient(180deg, #FBFFF1 0%, #D1FAE5 35%, #059669 70%, #042F2E 100%)'
        }}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-300/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-md">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload Knowledge Document</h2>
              <p className="text-sm font-extrabold text-emerald-950">Index PDF, TSV, CSV, or TXT into Dr. RAHM FAISS database</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-800 bg-white/90 hover:bg-white border-2 border-slate-900 transition-colors shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* High-Contrast Crisp Drag & Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer shadow-md ${
            isDragOver 
              ? 'border-emerald-700 bg-emerald-100 scale-[1.01]' 
              : selectedFile 
                ? 'border-emerald-600 bg-white' 
                : 'border-emerald-500 hover:border-emerald-700 bg-white/90 hover:bg-white'
          }`}
          onClick={() => document.getElementById('pdf-file-input').click()}
        >
          <input
            id="pdf-file-input"
            type="file"
            accept=".pdf,.tsv,.csv,.txt,.md"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          <div className="w-14 h-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold shadow-inner">
            <FileText className="w-7 h-7" />
          </div>

          {selectedFile ? (
            <div>
              <p className="text-lg font-black text-emerald-800">{selectedFile.name}</p>
              <p className="text-xs font-extrabold text-slate-700 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB • Ready to Index</p>
            </div>
          ) : (
            <div>
              <p className="text-base font-black text-slate-900">Drag & Drop your scientific PDF, TSV, or CSV file here</p>
              <p className="text-xs font-extrabold text-slate-700 mt-1">Supports .pdf, .tsv, .csv, .txt files</p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-100 border-2 border-red-500 text-red-900 text-xs font-bold shadow">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Progress Tracker */}
        {uploadState !== 'idle' && (
          <div className="space-y-2 bg-white/90 p-4 rounded-xl border border-emerald-300 shadow-sm">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-800 flex items-center gap-2 font-black">
                {uploadState !== 'completed' && <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />}
                {uploadState === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                {uploadState === 'uploading' && 'Uploading Document...'}
                {uploadState === 'extracting' && 'Extracting Data Chunks...'}
                {uploadState === 'embedding' && 'Generating Embeddings (all-MiniLM-L6-v2)...'}
                {uploadState === 'updating' && 'Updating Knowledge Base (FAISS Index)...'}
                {uploadState === 'completed' && 'Completed! Knowledge Base Updated.'}
              </span>
              <span className="text-slate-900 font-black">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-300">
              <div
                className="bg-[#10B981] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Action Button */}
        {selectedFile && uploadState === 'idle' && (
          <button
            onClick={handleUpload}
            className="w-full py-3.5 rounded-xl bg-[#042F2E] hover:bg-black text-white font-black text-base shadow-xl flex items-center justify-center gap-2 transition-all border-2 border-emerald-400"
          >
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            <span>Process & Index Document</span>
          </button>
        )}

        {/* Currently Indexed Knowledge Base List */}
        <div className="space-y-3 pt-2 border-t border-emerald-400/40">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-white">
            <span className="flex items-center gap-1.5 text-white">
              <Database className="w-4 h-4 text-emerald-300" />
              <span>Active Knowledge Base Documents ({docList.length})</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-200">
              <Layers className="w-4 h-4" />
              <span>{totalChunks} Chunks</span>
            </span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {docList.map((doc, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[#042F2E]/90 border border-emerald-500/40 text-xs text-white shadow-sm"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span className="text-white font-mono font-bold truncate">{doc.filename}</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-mono text-[11px] font-black shrink-0 shadow-sm">
                  {doc.chunks_count} Chunks
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
