import React, { useCallback, useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Image, X, CheckCircle, AlertCircle, Loader2, CloudUpload, Sparkles } from 'lucide-react';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const DropZone = ({ onSuccess }) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [pollCount, setPollCount] = useState(0);

  const validateFile = (f) => {
    if (!ACCEPTED_TYPES.includes(f.type)) return 'Only PDF, JPG, PNG, and WebP files are accepted.';
    if (f.size > MAX_SIZE) return 'File size must be under 10 MB.';
    return null;
  };

  const processFile = useCallback((f) => {
    const err = validateFile(f);
    if (err) { setErrorMsg(err); setStatus('error'); return; }
    setFile(f);
    setStatus('idle');
    setErrorMsg('');
    setUploadProgress(0);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  }, [processFile]);

  const handleFileInput = (e) => {
    const selected = e.target.files[0];
    if (selected) processFile(selected);
  };

  const pollStatus = (id, count = 0) => {
    if (count > 60) { setStatus('error'); setErrorMsg('AI processing timed out. Please try again.'); return; }
    setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/itinerary/${id}/status`);
        setPollCount(count + 1);
        if (data.status === 'ready') {
          setStatus('done');
          if (onSuccess) onSuccess(id);
        } else if (data.status === 'error') {
          setStatus('error');
          setErrorMsg(data.errorMessage || 'AI processing failed.');
        } else {
          pollStatus(id, count + 1);
        }
      } catch { setStatus('error'); setErrorMsg('Failed to check processing status.'); }
    }, 3000);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setUploadProgress(0);
    setErrorMsg('');
    const formData = new FormData();
    formData.append('document', file);
    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      setStatus('processing');
      pollStatus(data.itineraryId, 0);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setErrorMsg('');
    setUploadProgress(0);
    setPollCount(0);
  };

  const fileIcon = file?.type === 'application/pdf'
    ? <FileText className="w-8 h-8 text-red-400" />
    : <Image className="w-8 h-8 text-blue-400" />;

  return (
    <div className="w-full">
      {/* ── Idle dropzone ───────────────────────── */}
      {status === 'idle' && !file && (
        <label
          htmlFor="dropzone-input"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={dragOver ? 'dropzone-over' : 'dropzone-idle'}
        >
          <div className="flex flex-col items-center gap-4 p-12">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              dragOver ? 'bg-blue-100 scale-110' : 'bg-slate-100'
            }`}>
              <CloudUpload className={`w-8 h-8 transition-colors ${dragOver ? 'text-blue-500' : 'text-slate-400'}`} />
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-semibold mb-1">
                {dragOver ? 'Release to upload' : 'Drag & drop your travel document'}
              </p>
              <p className="text-slate-400 text-sm">PDF, JPG, PNG or WebP · Max 10 MB</p>
            </div>
            <span className="btn-secondary text-xs px-4 py-2">Browse Files</span>
            <input id="dropzone-input" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileInput} />
          </div>
        </label>
      )}

      {/* ── File selected ───────────────────────── */}
      {file && status === 'idle' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
              {fileIcon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={reset} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button id="upload-doc-btn" onClick={handleUpload} className="btn-primary w-full justify-center">
            <Sparkles className="w-4 h-4" /> Upload & Generate with AI
          </button>
        </div>
      )}

      {/* ── Uploading ──────────────────────────── */}
      {status === 'uploading' && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-semibold">Uploading document…</span>
            </div>
            <span className="text-sm font-bold text-blue-600">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* ── AI Processing ──────────────────────── */}
      {status === 'processing' && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-amber-500 animate-pulse-soft" />
          </div>
          <p className="font-bold text-slate-700 mb-1">AI is analyzing your document</p>
          <p className="text-slate-500 text-sm mb-4">Extracting trip details… This may take 15–30 seconds.</p>
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-soft" style={{ animationDelay: `${i * 250}ms` }} />
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-3">Attempt {pollCount + 1}…</p>
        </div>
      )}

      {/* ── Done ───────────────────────────────── */}
      {status === 'done' && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="font-bold text-slate-700 mb-1">Itinerary Generated!</p>
          <p className="text-slate-500 text-sm">Opening your new trip plan…</p>
        </div>
      )}

      {/* ── Error ──────────────────────────────── */}
      {status === 'error' && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 animate-fade-in">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-600">Upload Failed</p>
              <p className="text-xs text-slate-500 mt-0.5">{errorMsg}</p>
            </div>
          </div>
          <button onClick={reset} className="btn-secondary w-full justify-center text-sm">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default DropZone;
