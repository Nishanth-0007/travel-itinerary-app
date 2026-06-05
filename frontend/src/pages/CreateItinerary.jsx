import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, PenLine, Plus, Trash2, ChevronDown, ChevronUp,
  Loader2, MapPin, Calendar, AlertCircle, ArrowLeft, CheckCircle,
} from 'lucide-react';
import axios from 'axios';
import DropZone from '../components/DropZone';

const ACTIVITY_TYPES = ['activity', 'flight', 'hotel', 'food', 'transport', 'other'];

const defaultActivity = () => ({
  time: '',
  title: '',
  description: '',
  location: '',
  type: 'activity',
  notes: '',
});

const defaultDay = (index) => ({
  date: '',
  dayLabel: `Day ${index + 1}`,
  activities: [defaultActivity()],
});

const CreateItinerary = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('upload'); // 'upload' | 'manual'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDays, setExpandedDays] = useState({ 0: true });
  const [form, setForm] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    days: [defaultDay(0)],
  });

  const handleFormChange = (field, value) => { setForm((p) => ({ ...p, [field]: value })); setError(''); };
  const handleDayChange   = (di, field, value) => setForm((p) => { const d = [...p.days]; d[di] = { ...d[di], [field]: value }; return { ...p, days: d }; });
  const handleActChange   = (di, ai, field, value) => setForm((p) => {
    const d = [...p.days]; const acts = [...d[di].activities];
    acts[ai] = { ...acts[ai], [field]: value }; d[di] = { ...d[di], activities: acts }; return { ...p, days: d };
  });

  const addDay = () => {
    const newLen = form.days.length;
    setForm((p) => ({ ...p, days: [...p.days, defaultDay(p.days.length)] }));
    setExpandedDays((p) => ({ ...p, [newLen]: true }));
  };
  const removeDay = (di) => { if (form.days.length === 1) return; setForm((p) => ({ ...p, days: p.days.filter((_, i) => i !== di) })); };
  const addActivity = (di) => setForm((p) => { const d = [...p.days]; d[di] = { ...d[di], activities: [...d[di].activities, defaultActivity()] }; return { ...p, days: d }; });
  const removeActivity = (di, ai) => setForm((p) => { const d = [...p.days]; d[di] = { ...d[di], activities: d[di].activities.filter((_, i) => i !== ai) }; return { ...p, days: d }; });
  const toggleDay = (di) => setExpandedDays((p) => ({ ...p, [di]: !p[di] }));

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.destination.trim()) { setError('Title and destination are required.'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/itinerary', form);
      navigate(`/itinerary/${data.itinerary._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create itinerary.');
    } finally { setLoading(false); }
  };

  const handleUploadSuccess = (itineraryId) => setTimeout(() => navigate(`/itinerary/${itineraryId}`), 500);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Plan a New Trip</h1>
          <p className="text-slate-400 text-sm">Upload a travel document for AI extraction, or build your itinerary manually.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'upload', icon: Upload,  label: 'AI from Document' },
            { key: 'manual', icon: PenLine, label: 'Build Manually' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              id={`mode-${key}-btn`}
              onClick={() => setMode(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                mode === key
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── UPLOAD MODE ─────────────────────────────────────────── */}
        {mode === 'upload' && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h2 className="text-lg font-bold text-slate-700 mb-1 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Upload Travel Document
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Our AI will extract trip details from your booking confirmation, flight itinerary, or travel PDF.
              </p>
              <DropZone onSuccess={handleUploadSuccess} />
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-600 text-center">
                💡 Works best with booking confirmations, flight emails, hotel receipts, and travel PDFs.
              </p>
            </div>
          </div>
        )}

        {/* ── MANUAL MODE ─────────────────────────────────────────── */}
        {mode === 'manual' && (
          <form id="manual-itinerary-form" onSubmit={handleManualSubmit} className="space-y-5 animate-fade-in">
            {/* Trip Basics */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                Trip Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="trip-title" className="input-label">Trip Title *</label>
                  <input id="trip-title" type="text" placeholder="e.g. Tokyo Adventure 2025"
                    value={form.title} onChange={(e) => handleFormChange('title', e.target.value)}
                    className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="trip-destination" className="input-label">Destination *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input id="trip-destination" type="text" placeholder="e.g. Tokyo, Japan"
                      value={form.destination} onChange={(e) => handleFormChange('destination', e.target.value)}
                      className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label htmlFor="trip-start" className="input-label">Start Date</label>
                  <input id="trip-start" type="date" value={form.startDate}
                    onChange={(e) => handleFormChange('startDate', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label htmlFor="trip-end" className="input-label">End Date</label>
                  <input id="trip-end" type="date" value={form.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)} className="input-field" />
                </div>
              </div>
            </div>

            {/* Days */}
            <div className="space-y-3">
              {form.days.map((day, di) => (
                <div key={di} className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                  {/* Day header */}
                  <button
                    type="button"
                    onClick={() => toggleDay(di)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm shadow-blue-200">
                      {di + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-slate-700 font-semibold text-sm">{day.dayLabel || `Day ${di + 1}`}</span>
                      {day.date && <span className="text-slate-400 text-xs ml-2">· {day.date}</span>}
                      <span className="text-slate-400 text-xs ml-2">({day.activities.length} activit{day.activities.length === 1 ? 'y' : 'ies'})</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {form.days.length > 1 && (
                        <span onClick={(e) => { e.stopPropagation(); removeDay(di); }}
                          className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-400 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {expandedDays[di]
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />
                      }
                    </div>
                  </button>

                  {/* Day content */}
                  {expandedDays[di] && (
                    <div className="px-4 pb-4 border-t border-slate-50 space-y-3 pt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="input-label text-xs">Day Label</label>
                          <input type="text" placeholder="e.g. Arrival & Exploration"
                            value={day.dayLabel} onChange={(e) => handleDayChange(di, 'dayLabel', e.target.value)}
                            className="input-field text-sm py-2" />
                        </div>
                        <div>
                          <label className="input-label text-xs">Date</label>
                          <input type="date" value={day.date}
                            onChange={(e) => handleDayChange(di, 'date', e.target.value)}
                            className="input-field text-sm py-2" />
                        </div>
                      </div>

                      {/* Activities */}
                      <div className="space-y-2">
                        {day.activities.map((act, ai) => (
                          <div key={ai} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Activity {ai + 1}</span>
                              {day.activities.length > 1 && (
                                <button type="button" onClick={() => removeActivity(di, ai)}
                                  className="text-slate-400 hover:text-red-400 transition-colors p-0.5">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                              <input type="time" value={act.time}
                                onChange={(e) => handleActChange(di, ai, 'time', e.target.value)}
                                className="input-field text-xs py-1.5" />
                              <select value={act.type}
                                onChange={(e) => handleActChange(di, ai, 'type', e.target.value)}
                                className="input-field text-xs py-1.5">
                                {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                              </select>
                              <input type="text" placeholder="Title *" value={act.title}
                                onChange={(e) => handleActChange(di, ai, 'title', e.target.value)}
                                className="input-field text-xs py-1.5 col-span-2" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input type="text" placeholder="Location" value={act.location}
                                onChange={(e) => handleActChange(di, ai, 'location', e.target.value)}
                                className="input-field text-xs py-1.5" />
                              <input type="text" placeholder="Description (optional)" value={act.description}
                                onChange={(e) => handleActChange(di, ai, 'description', e.target.value)}
                                className="input-field text-xs py-1.5" />
                            </div>
                          </div>
                        ))}

                        <button type="button" onClick={() => addActivity(di)}
                          className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 text-xs flex items-center justify-center gap-1.5 transition-all duration-200">
                          <Plus className="w-3.5 h-3.5" /> Add Activity
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Day */}
            <button type="button" id="add-day-btn" onClick={addDay}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-300 hover:text-blue-500 flex items-center justify-center gap-2 transition-all duration-200 bg-white">
              <Calendar className="w-4 h-4" /> Add Day
            </button>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            {/* Submit */}
            <button id="create-itinerary-btn" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                : <><CheckCircle className="w-5 h-5" /> Create Itinerary</>
              }
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default CreateItinerary;
