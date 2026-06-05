import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Layers, Plane, Hotel, Utensils,
  Compass, Car, HelpCircle, Clock, Navigation, FileText, Printer,
  AlertCircle, Loader2, CheckCircle, Camera, Map, Plus, Edit3,
  LayoutList, CalendarDays, Share2, Download, Sparkles, MoreHorizontal,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import axios from 'axios';

/* ── Activity type config ────────────────────────────────────── */
const ACT = {
  flight:    { icon: Plane,      bg: 'bg-blue-100',    color: 'text-blue-600',    border: 'border-blue-200',    label: 'Flight' },
  hotel:     { icon: Hotel,      bg: 'bg-purple-100',  color: 'text-purple-600',  border: 'border-purple-200',  label: 'Hotel' },
  food:      { icon: Utensils,   bg: 'bg-amber-100',   color: 'text-amber-600',   border: 'border-amber-200',   label: 'Dining' },
  activity:  { icon: Compass,    bg: 'bg-teal-100',    color: 'text-teal-600',    border: 'border-teal-200',    label: 'Activity' },
  transport: { icon: Car,        bg: 'bg-emerald-100', color: 'text-emerald-600', border: 'border-emerald-200', label: 'Transport' },
  other:     { icon: HelpCircle, bg: 'bg-slate-100',   color: 'text-slate-500',   border: 'border-slate-200',   label: 'Other' },
};

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* ── Helpers ────────────────────────────────────────────────── */
const fmtDate = (d, opts = {}) => {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', ...opts }); }
  catch { return d; }
};

const fmtShort = (d) => {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
};

/* ── Activity Card (List view) ──────────────────────────────── */
const ActivityCard = ({ activity, isLast, dayDate }) => {
  const cfg = ACT[activity.type] || ACT.other;
  const Icon = cfg.icon;
  const [photoHover, setPhotoHover] = useState(false);
  const [mapHover, setMapHover]   = useState(false);

  return (
    <div className="flex gap-4 group">
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${cfg.color}`} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-100 mt-2 min-h-[1.5rem]" />}
      </div>

      {/* Card */}
      <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`badge ${cfg.bg} ${cfg.color} text-xs`}>{cfg.label}</span>
                {activity.time && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-slate-800 leading-snug">{activity.title}</h4>
            </div>

            {/* Action icons: Photo + Map */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                title="Add photo"
                onMouseEnter={() => setPhotoHover(true)}
                onMouseLeave={() => setPhotoHover(false)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                  photoHover ? 'bg-purple-100 text-purple-500' : 'bg-slate-50 text-slate-400 hover:bg-purple-50 hover:text-purple-400'
                }`}
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                title="View on map"
                onMouseEnter={() => setMapHover(true)}
                onMouseLeave={() => setMapHover(false)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                  mapHover ? 'bg-blue-100 text-blue-500' : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-400'
                }`}
                onClick={() => {
                  if (activity.location) {
                    window.open(`https://www.google.com/maps/search/${encodeURIComponent(activity.location)}`, '_blank');
                  }
                }}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>

          {activity.description && (
            <p className="text-sm text-slate-500 mb-2 leading-relaxed">{activity.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {activity.location && (
              <button
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 transition-colors"
                onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(activity.location)}`, '_blank')}
              >
                <Navigation className="w-3 h-3 text-blue-400" />
                {activity.location}
              </button>
            )}
          </div>

          {activity.notes && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-700 flex items-start gap-1.5">
                <FileText className="w-3 h-3 flex-shrink-0 mt-0.5" /> {activity.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Day Section (List view) ────────────────────────────────── */
const DaySection = ({ day, dayNumber }) => (
  <div
    id={`day-${dayNumber}`}
    className="mb-10 animate-fade-in-up"
    style={{ animationDelay: `${dayNumber * 80}ms` }}
  >
    <div className="flex items-center gap-4 mb-5">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200">
        <span className="text-white font-bold text-lg">{dayNumber}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-800">{day.dayLabel || `Day ${dayNumber}`}</h3>
        {day.date && (
          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            {fmtDate(day.date) || day.date}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
        <Layers className="w-3.5 h-3.5" />
        {day.activities?.length || 0} activities
      </div>
    </div>

    {day.activities?.length > 0 ? (
      <div className="ml-2 pl-5 border-l-2 border-dashed border-slate-100">
        {day.activities.map((act, i) => (
          <ActivityCard key={i} activity={act} isLast={i === day.activities.length - 1} dayDate={day.date} />
        ))}
      </div>
    ) : (
      <div className="ml-16 py-6 text-center border-2 border-dashed border-slate-100 rounded-2xl">
        <p className="text-sm text-slate-400">No activities — click + to add some</p>
      </div>
    )}
  </div>
);

/* ── Mini Calendar View ─────────────────────────────────────── */
const CalendarView = ({ days, startDate }) => {
  const base = startDate ? new Date(startDate) : new Date();
  const [calMonth, setCalMonth] = useState(base.getMonth());
  const [calYear,  setCalYear]  = useState(base.getFullYear());

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // Build map: "YYYY-MM-DD" → activities[]
  const actMap = {};
  days?.forEach((day) => {
    if (day.date) {
      const key = day.date.slice(0, 10);
      actMap[key] = day.activities || [];
    }
  });

  const ACT_COLORS = { flight: '#3b82f6', hotel: '#a855f7', food: '#f59e0b', activity: '#14b8a6', transport: '#10b981', other: '#94a3b8' };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="animate-fade-in">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button onClick={() => { const d = new Date(calYear, calMonth - 1, 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); }} className="btn-ghost p-2">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-base font-bold text-slate-700">{MONTH_NAMES[calMonth]} {calYear}</h3>
        <button onClick={() => { const d = new Date(calYear, calMonth + 1, 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); }} className="btn-ghost p-2">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
          const acts = actMap[dateStr] || [];
          const isToday = dateStr === today;
          const hasEvents = acts.length > 0;

          return (
            <div
              key={dayNum}
              className={`min-h-[80px] p-2 rounded-xl border transition-colors ${
                isToday ? 'border-blue-400 ring-2 ring-blue-200 bg-blue-50/50' :
                hasEvents ? 'border-blue-100 bg-blue-50/20 hover:bg-blue-50/40' :
                'border-slate-100 bg-white hover:bg-slate-50'
              }`}
            >
              <p className={`text-xs font-semibold mb-1.5 ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                {dayNum}
              </p>
              {acts.slice(0, 2).map((act, j) => (
                <div
                  key={j}
                  className="text-[10px] px-1.5 py-0.5 rounded-md text-white font-medium truncate mb-0.5"
                  style={{ backgroundColor: ACT_COLORS[act.type] || ACT_COLORS.other }}
                  title={act.title}
                >
                  {act.title}
                </div>
              ))}
              {acts.length > 2 && (
                <p className="text-[10px] text-slate-400 font-medium">+{acts.length - 2} more</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-100">
        {Object.entries(ACT_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Main ViewItinerary page ────────────────────────────────── */
const ViewItinerary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('list'); // 'list' | 'calendar'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get(`/api/itinerary/${id}`)
      .then(({ data }) => setItinerary(data.itinerary))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
        <p className="text-slate-400 text-sm">Loading itinerary…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-3xl shadow-card p-10 text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="font-bold text-slate-700 mb-2">Couldn't load this itinerary</p>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Dashboard</button>
      </div>
    </div>
  );

  /* ── Processing/Error states ─────────────────────────────── */
  if (itinerary?.status === 'processing' || itinerary?.status === 'pending') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-3xl shadow-card p-10 text-center max-w-md animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-amber-500 animate-pulse-soft" />
        </div>
        <h2 className="text-xl font-bold text-slate-700 mb-2">AI is generating your itinerary</h2>
        <p className="text-sm text-slate-400 mb-6">This usually takes 15–30 seconds.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Back</button>
      </div>
    </div>
  );

  if (itinerary?.status === 'error') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-3xl shadow-card p-10 text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Generation Failed</h2>
        <p className="text-sm text-slate-400 mb-6">{itinerary.errorMessage || 'An AI error occurred.'}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> Dashboard</button>
          <Link to="/itinerary/create" className="btn-primary">Try Again</Link>
        </div>
      </div>
    </div>
  );

  if (!itinerary) return null;

  const totalActivities = itinerary.days?.reduce((s, d) => s + (d.activities?.length || 0), 0) || 0;

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm no-print">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <button
            id="back-btn"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 mb-4 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            All Trips
          </button>

          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Info */}
            <div className="flex-1 page-enter">
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-2">
                <MapPin className="w-4 h-4" /> {itinerary.destination}
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-3 leading-tight">{itinerary.title}</h1>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-2">
                {(itinerary.startDate || itinerary.endDate) && (
                  <span className="tag-pill">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    {fmtShort(itinerary.startDate)}{itinerary.startDate && itinerary.endDate ? ' → ' : ''}{fmtShort(itinerary.endDate)}
                  </span>
                )}
                {itinerary.days?.length > 0 && (
                  <span className="tag-pill"><Layers className="w-3 h-3 text-purple-400" /> {itinerary.days.length} days</span>
                )}
                <span className="tag-pill"><CheckCircle className="w-3 h-3 text-emerald-400" /> {totalActivities} activities</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <button
                id="share-view-btn"
                onClick={handleShare}
                className={`btn-secondary ${copied ? 'border-emerald-300 text-emerald-600' : ''}`}
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Copied!' : 'Share'}
              </button>
              <button
                id="print-btn"
                onClick={() => window.print()}
                className="btn-secondary"
              >
                <Printer className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* View Toggle + Day Nav */}
        <div className="flex items-center justify-between mb-6 no-print">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              id="view-list-btn"
              onClick={() => setView('list')}
              className={view === 'list' ? 'view-tab-active' : 'view-tab'}
            >
              <LayoutList className="w-4 h-4" /> Timeline
            </button>
            <button
              id="view-calendar-btn"
              onClick={() => setView('calendar')}
              className={view === 'calendar' ? 'view-tab-active' : 'view-tab'}
            >
              <CalendarDays className="w-4 h-4" /> Calendar
            </button>
          </div>

          {/* Quick day jumps (list only) */}
          {view === 'list' && itinerary.days?.length > 2 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {itinerary.days.slice(0, 7).map((_, i) => (
                <a
                  key={i}
                  href={`#day-${i + 1}`}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-500 flex items-center justify-center hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
                >
                  {i + 1}
                </a>
              ))}
              {itinerary.days.length > 7 && (
                <span className="text-xs text-slate-400">+{itinerary.days.length - 7} more</span>
              )}
            </div>
          )}
        </div>

        {/* ── LIST VIEW ──────────────────────────────────────── */}
        {view === 'list' && (
          itinerary.days?.length > 0 ? (
            <div>
              {itinerary.days.map((day, i) => (
                <React.Fragment key={i}>
                  <DaySection day={day} dayNumber={i + 1} />
                  {i < itinerary.days.length - 1 && <div className="border-t border-slate-100 mb-10" />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No days planned yet</p>
              <p className="text-slate-400 text-sm mt-1">Go back and add some days to your itinerary.</p>
            </div>
          )
        )}

        {/* ── CALENDAR VIEW ─────────────────────────────────── */}
        {view === 'calendar' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6">
            <CalendarView days={itinerary.days} startDate={itinerary.startDate} />
          </div>
        )}
      </div>
    </main>
  );
};

export default ViewItinerary;
