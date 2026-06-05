import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Map, Compass, TrendingUp, Calendar, Sparkles,
  Search, Filter, Grid, List, ChevronRight,
  Plane, Star, Zap, Globe,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ItineraryCard from '../components/ItineraryCard';
import NewItineraryModal from '../components/NewItineraryModal';

/* ── Skeleton card ─────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card">
    <div className="skeleton h-40" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-2/3" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-8 flex-1" />
        <div className="skeleton h-8 w-20" />
      </div>
    </div>
  </div>
);

/* ── Stat card ─────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, trend, delay = '' }) => (
  <div className={`stat-card animate-fade-in-up ${delay}`}>
    <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      {trend && <p className="text-xs text-emerald-500 font-medium mt-0.5">{trend}</p>}
    </div>
  </div>
);

/* ── Feature highlight ─────────────────────────────────────── */
const FeatureChip = ({ icon: Icon, label, color }) => (
  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${color}`}>
    <Icon className="w-3.5 h-3.5" />
    {label}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [gridView, setGridView] = useState(true);

  const fetchItineraries = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/itinerary?page=${p}&limit=12`);
      setItineraries(data.itineraries);
      setPagination(data.pagination);
    } catch { setError('Failed to load itineraries.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItineraries(page); }, [fetchItineraries, page]);

  const handleDelete = (id) => setItineraries((prev) => prev.filter((it) => it._id !== id));

  const handleModalSuccess = (itineraryId) => {
    setModalOpen(false);
    if (itineraryId) navigate(`/itinerary/${itineraryId}`);
    else fetchItineraries(1);
  };

  const filtered = itineraries.filter((it) =>
    !search ||
    it.title?.toLowerCase().includes(search.toLowerCase()) ||
    it.destination?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDays = itineraries.reduce((s, it) => s + (it.days?.length || 0), 0);
  const destinations = new Set(itineraries.map((it) => it.destination).filter(Boolean)).size;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <main className="min-h-screen bg-slate-50">
        {/* ── Hero Banner ────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          {/* BG decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 animate-spin-slow" />
            <div className="absolute top-10 right-40 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 left-1/3 w-60 h-60 rounded-full bg-blue-500/30" />
            <div className="absolute bottom-0 right-0 text-[200px] leading-none text-white/5 font-bold select-none">
              ✈
            </div>
          </div>

          <div className="relative max-w-[1400px] mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              {/* Left: Greeting + CTA */}
              <div className="flex-1 page-enter">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    AI-Powered Planning
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                  {greeting()}, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-blue-200 text-lg mb-6">
                  Where are you heading next?
                </p>

                {/* Feature chips */}
                <div className="flex flex-wrap gap-2 mb-8">
                  <FeatureChip icon={Sparkles} label="AI Itinerary Generation" color="bg-white/10 text-white/90" />
                  <FeatureChip icon={Globe} label="Any Destination" color="bg-white/10 text-white/90" />
                  <FeatureChip icon={Zap} label="Instant Plans" color="bg-white/10 text-white/90" />
                </div>

                {/* BIG new itinerary button */}
                <button
                  id="hero-new-itinerary-btn"
                  onClick={() => setModalOpen(true)}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  New Itinerary
                  <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Right: Quick Stats */}
              <div className="grid grid-cols-2 gap-3 md:w-72 flex-shrink-0">
                {[
                  { icon: Map, label: 'Total Trips', value: pagination.total || 0, bg: 'bg-white/10', color: 'text-white' },
                  { icon: Calendar, label: 'Days Planned', value: totalDays, bg: 'bg-white/10', color: 'text-white' },
                  { icon: Globe, label: 'Destinations', value: destinations, bg: 'bg-white/10', color: 'text-white' },
                  { icon: Star, label: 'AI Generated', value: itineraries.filter(i => i.documentUrl).length, bg: 'bg-white/10', color: 'text-white' },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                    <s.icon className="w-5 h-5 text-blue-200 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-blue-200 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto px-6 py-8">

          {/* Search + Filters bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search trips or destinations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 py-2"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button className="btn-ghost text-slate-500">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              {/* View toggle */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
                <button
                  onClick={() => setGridView(true)}
                  className={gridView ? 'view-tab-active' : 'view-tab'}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setGridView(false)}
                  className={!gridView ? 'view-tab-active' : 'view-tab'}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                id="content-new-btn"
                onClick={() => setModalOpen(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                New Itinerary
              </button>
            </div>
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              {search ? `Results for "${search}"` : 'Your Itineraries'}
              {!loading && <span className="ml-2 text-sm text-slate-400 font-normal">({filtered.length})</span>}
            </h2>
            {pagination.pages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost disabled:opacity-30">← Prev</button>
                <span className="text-xs text-slate-400 font-medium">{page} / {pagination.pages}</span>
                <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-ghost disabled:opacity-30">Next →</button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-center py-10">{error}</p>}

          {/* Loading skeletons */}
          {loading && (
            <div className={gridView
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
              : 'flex flex-col gap-4'
            }>
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
              <div className="w-28 h-28 rounded-3xl bg-blue-50 flex items-center justify-center mb-6 animate-float shadow-card">
                <Plane className="w-14 h-14 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                {search ? 'No trips match your search' : 'No trips planned yet'}
              </h3>
              <p className="text-slate-400 mb-8 max-w-sm text-sm leading-relaxed">
                {search
                  ? 'Try a different search term.'
                  : 'Create your first AI-powered itinerary. Upload a travel document or build one from scratch.'}
              </p>
              {!search && (
                <button id="empty-state-btn" onClick={() => setModalOpen(true)} className="btn-primary-lg">
                  <Plus className="w-5 h-5" />
                  Plan Your First Trip
                </button>
              )}
            </div>
          )}

          {/* Grid / List */}
          {!loading && !error && filtered.length > 0 && (
            <div className={
              gridView
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-in'
                : 'flex flex-col gap-3 animate-fade-in'
            }>
              {filtered.map((it, i) => (
                <div
                  key={it._id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                >
                  <ItineraryCard
                    itinerary={it}
                    onDelete={handleDelete}
                    listView={!gridView}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Itinerary Modal */}
      {modalOpen && (
        <NewItineraryModal
          onClose={() => setModalOpen(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
};

export default Dashboard;
