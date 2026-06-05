import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Upload, PenLine, FileText, Image, CloudUpload,
  CheckCircle, AlertCircle, Loader2, Plus, Sparkles,
  ArrowRight, MapPin, Calendar,
} from 'lucide-react';
import axios from 'axios';

const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 10;

const NewItineraryModal = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('upload'); // 'upload' | 'manual'

  /* ── Upload state ────────────────────────────────── */
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle|uploading|processing|done|error
  const [uploadError, setUploadError] = useState('');
  const [pollCount, setPollCount] = useState(0);
  const [itineraryId, setItineraryId] = useState(null);

  /* ── Manual state ────────────────────────────────── */
  const [form, setForm] = useState({ title: '', destination: '', startDate: '', endDate: '' });
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState('');

  /* ── File handling ───────────────────────────────── */
  const validateFile = (f) => {
    if (!ACCEPTED.includes(f.type)) return 'Only PDF, JPG, PNG, WebP accepted.';
    if (f.size > MAX_MB * 1024 * 1024) return `File must be under ${MAX_MB} MB.`;
    return null;
  };

  const processFile = useCallback((f) => {
    const err = validateFile(f);
    if (err) { setUploadError(err); setUploadStatus('error'); return; }
    setFile(f);
    setUploadStatus('idle');
    setUploadError('');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  /* ── Upload & poll ───────────────────────────────── */
  const pollStatus = (id, count = 0) => {
    if (count > 60) { setUploadStatus('error'); setUploadError('AI processing timed out.'); return; }
    setTimeout(async () => {
      try {
        const { data } = await axios.get(`/api/itinerary/${id}/status`);
        setPollCount(count + 1);
        if (data.status === 'ready')       { setUploadStatus('done'); setItineraryId(id); setTimeout(() => onSuccess(id), 800); }
        else if (data.status === 'error')  { setUploadStatus('error'); setUploadError(data.errorMessage || 'AI failed.'); }
        else                               { pollStatus(id, count + 1); }
      } catch { setUploadStatus('error'); setUploadError('Could not check status.'); }
    }, 3000);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploadStatus('uploading'); setUploadPct(0); setUploadError('');
    const fd = new FormData(); fd.append('document', file);
    try {
      const { data } = await axios.post('/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadPct(Math.round((e.loaded * 100) / e.total)),
      });
      setItineraryId(data.itineraryId);
      setUploadStatus('processing');
      pollStatus(data.itineraryId, 0);
    } catch (e) {
      setUploadStatus('error'); setUploadError(e.response?.data?.message || 'Upload failed.');
    }
  };

  /* ── Manual submit ───────────────────────────────── */
  const handleManual = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.destination.trim()) { setManualError('Title and destination are required.'); return; }
    setManualLoading(true);
    try {
      const { data } = await axios.post('/api/itinerary', { ...form, days: [] });
      onSuccess(data.itinerary._id);
    } catch (e) { setManualError(e.response?.data?.message || 'Failed to create.'); }
    finally { setManualLoading(false); }
  };

  const fileIcon = file?.type === 'application/pdf'
    ? <FileText className="w-8 h-8 text-red-400" />
    : <Image className="w-8 h-8 text-blue-400" />;

  const isUploading = uploadStatus === 'uploading' || uploadStatus === 'processing';

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !isUploading) onClose(); }}>
      <div className="modal-panel w-full max-w-2xl bg-white rounded-3xl shadow-modal overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">New Itinerary</h2>
              <p className="text-xs text-slate-400">Team Orbitra · Smart Travel Planner</p>
            </div>
          </div>
          {!isUploading && (
            <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-5 pb-1">
          {[
            { key: 'upload', icon: Sparkles, label: 'AI from Document' },
            { key: 'manual', icon: PenLine, label: 'Build Manually' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              id={`modal-tab-${key}`}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === key
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 py-5">

          {/* ── UPLOAD TAB ─────────────────────────────── */}
          {tab === 'upload' && (
            <div className="animate-fade-in space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                Upload a travel document — booking confirmation, flight email, or any PDF — and our AI will extract and structure your complete itinerary instantly.
              </p>

              {/* Dropzone — idle */}
              {uploadStatus === 'idle' && !file && (
                <label
                  htmlFor="modal-file-input"
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={dragOver ? 'dropzone-over' : 'dropzone-idle'}
                >
                  <div className="flex flex-col items-center gap-4 p-10">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-300 ${
                      dragOver ? 'bg-blue-100 scale-110' : 'bg-slate-100'
                    }`}>
                      <CloudUpload className={`w-10 h-10 transition-colors ${dragOver ? 'text-blue-500' : 'text-slate-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-700 mb-1">
                        {dragOver ? 'Release to upload' : 'Drag & drop your document'}
                      </p>
                      <p className="text-sm text-slate-400">PDF, JPG, PNG, or WebP · Max 10 MB</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 bg-white hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer shadow-sm">
                      <Upload className="w-4 h-4" /> Browse Files
                    </span>
                  </div>
                  <input id="modal-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) processFile(f); }} />
                </label>
              )}

              {/* File selected */}
              {uploadStatus === 'idle' && file && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-fade-in">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
                    {fileIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => { setFile(null); setUploadError(''); }} className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Uploading */}
              {uploadStatus === 'uploading' && (
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-semibold">Uploading document…</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">{uploadPct}%</span>
                  </div>
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${uploadPct}%` }} />
                  </div>
                </div>
              )}

              {/* AI Processing */}
              {uploadStatus === 'processing' && (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-center animate-fade-in">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-amber-500 animate-pulse-soft" />
                  </div>
                  <p className="font-bold text-slate-700 mb-1">AI is crafting your itinerary</p>
                  <p className="text-sm text-slate-500 mb-4">Extracting trip details, activities & highlights… (~15-30s)</p>
                  <div className="flex items-center justify-center gap-2">
                    {[0,1,2,3].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-soft" style={{ animationDelay: `${i*200}ms` }} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-3">Attempt {pollCount + 1}…</p>
                </div>
              )}

              {/* Done */}
              {uploadStatus === 'done' && (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center animate-fade-in">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                  </div>
                  <p className="font-bold text-slate-700 mb-1">Itinerary Generated!</p>
                  <p className="text-sm text-slate-500">Opening your new trip plan…</p>
                </div>
              )}

              {/* Error */}
              {uploadStatus === 'error' && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-600">Upload Failed</p>
                      <p className="text-xs text-slate-500 mt-0.5">{uploadError}</p>
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); setUploadStatus('idle'); setUploadError(''); }} className="mt-3 text-xs text-blue-600 font-medium hover:underline">
                    ← Try again
                  </button>
                </div>
              )}

              {/* Tip */}
              {uploadStatus === 'idle' && (
                <p className="text-center text-xs text-slate-400">
                  💡 Works great with booking confirmations, flight emails, hotel receipts & travel PDFs
                </p>
              )}
            </div>
          )}

          {/* ── MANUAL TAB ─────────────────────────────── */}
          {tab === 'manual' && (
            <form id="modal-manual-form" onSubmit={handleManual} className="animate-fade-in space-y-4">
              <p className="text-sm text-slate-500">Fill in the basics and build your day-by-day plan on the next screen.</p>

              <div>
                <label className="input-label">Trip Title *</label>
                <input
                  id="modal-title"
                  type="text"
                  placeholder="e.g. Tokyo Adventure 2025"
                  value={form.title}
                  onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setManualError(''); }}
                  className="input-field"
                />
              </div>

              <div>
                <label className="input-label">Destination *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="modal-destination"
                    type="text"
                    placeholder="e.g. Tokyo, Japan"
                    value={form.destination}
                    onChange={(e) => { setForm((p) => ({ ...p, destination: e.target.value })); setManualError(''); }}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="modal-start"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                      className="input-field pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="modal-end"
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                      className="input-field pl-9"
                    />
                  </div>
                </div>
              </div>

              {manualError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {manualError}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button onClick={onClose} disabled={isUploading} className="btn-ghost text-slate-500 disabled:opacity-40">
            Cancel
          </button>
          {tab === 'upload' ? (
            <button
              id="modal-upload-btn"
              onClick={handleUpload}
              disabled={!file || isUploading || uploadStatus === 'done'}
              className="btn-primary disabled:opacity-40"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate with AI <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          ) : (
            <button
              id="modal-create-btn"
              onClick={handleManual}
              disabled={manualLoading}
              className="btn-primary"
            >
              {manualLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              ) : (
                <>Create Itinerary <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewItineraryModal;
