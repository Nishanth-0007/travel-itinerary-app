import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Layers, Edit2, Share2, Trash2,
  Loader2, AlertCircle, CheckCircle, Clock, Sparkles,
  MoreHorizontal, ExternalLink, Copy, Check,
} from 'lucide-react';
import axios from 'axios';

const STATUS_MAP = {
  ready:      { label: 'Ready',      cls: 'badge-green',  icon: CheckCircle },
  processing: { label: 'Processing', cls: 'badge-blue',   icon: Loader2, spin: true },
  error:      { label: 'Error',      cls: 'badge-red',    icon: AlertCircle },
  pending:    { label: 'Pending',    cls: 'badge-slate',  icon: Clock },
};

const COVER_THEMES = [
  { bg: 'from-blue-400 to-blue-600',    emoji: '🗼' },
  { bg: 'from-emerald-400 to-teal-600', emoji: '🌴' },
  { bg: 'from-rose-400 to-pink-600',    emoji: '🌸' },
  { bg: 'from-amber-400 to-orange-500', emoji: '🏜️' },
  { bg: 'from-purple-400 to-violet-600',emoji: '🏰' },
  { bg: 'from-sky-400 to-blue-500',     emoji: '🏖️' },
];

const AI_HIGHLIGHTS = [
  'Best local restaurants curated',
  'Hidden gems included',
  'Optimized travel routes',
  'Cultural experiences added',
  'Weather-aware scheduling',
  'Budget-friendly options',
];

const fmtDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ItineraryCard = ({ itinerary, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const { _id, title, destination, startDate, endDate, days, status, createdAt } = itinerary;

  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const idx = _id ? _id.charCodeAt(_id.length - 1) % COVER_THEMES.length : 0;
  const theme = COVER_THEMES[idx];
  const highlight = AI_HIGHLIGHTS[_id ? _id.charCodeAt(2) % AI_HIGHLIGHTS.length : 0];

  const statusCfg = STATUS_MAP[status] || STATUS_MAP.pending;
  const StatusIcon = statusCfg.icon;

  const totalActivities = days?.reduce((s, d) => s + (d.activities?.length || 0), 0) || 0;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${title}"?`)) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/itinerary/${_id}`);
      if (onDelete) onDelete(_id);
    } catch { alert('Failed to delete.'); }
    setDeleting(false);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/itinerary/${_id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/itinerary/${_id}`);
    if (onEdit) onEdit(_id);
  };

  return (
    <div
      className="group relative bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => navigate(`/itinerary/${_id}`)}
    >
      {/* Cover */}
      <div className={`relative h-40 bg-gradient-to-br ${theme.bg} overflow-hidden`}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute top-2 right-4 w-12 h-12 rounded-full bg-white/10" />

        {/* Emoji */}
        <div className="absolute bottom-4 left-4 text-4xl filter drop-shadow-lg animate-float">
          {theme.emoji}
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
          <span className={`${statusCfg.cls} shadow-sm`}>
            <StatusIcon className={`w-3 h-3 ${statusCfg.spin ? 'animate-spin' : ''}`} />
            {statusCfg.label}
          </span>
        </div>

        {/* More menu */}
        <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <button
              id={`card-menu-${_id}`}
              onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
              className="w-7 h-7 rounded-lg bg-black/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/30 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                <div className="absolute left-0 mt-1 w-44 bg-white border border-slate-100 rounded-xl shadow-modal z-20 overflow-hidden animate-scale-in text-sm">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/itinerary/${_id}`); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </button>
                  <button onClick={handleShare} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-600 transition-colors">
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </button>
                  <div className="border-t border-slate-50 my-0.5" />
                  <button onClick={handleDelete} disabled={deleting} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-500 transition-colors disabled:opacity-40">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Destination */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span className="truncate font-medium">{destination || 'Unknown destination'}</span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-base leading-snug mb-3 line-clamp-1 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(startDate || endDate) && (
            <span className="tag-pill">
              <Calendar className="w-3 h-3 text-blue-400" />
              {fmtDate(startDate)}{startDate && endDate ? ' → ' : ''}{fmtDate(endDate)}
            </span>
          )}
          {days?.length > 0 && (
            <span className="tag-pill">
              <Layers className="w-3 h-3 text-purple-400" />
              {days.length} day{days.length !== 1 ? 's' : ''}
            </span>
          )}
          {totalActivities > 0 && (
            <span className="tag-pill">
              {totalActivities} activities
            </span>
          )}
        </div>

        {/* AI Highlight */}
        {status === 'ready' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100 mb-3">
            <Sparkles className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <span className="text-xs text-blue-600 font-medium truncate">{highlight}</span>
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
          <button
            id={`edit-itinerary-${_id}`}
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            id={`share-itinerary-${_id}`}
            onClick={handleShare}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
              copied
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItineraryCard;
