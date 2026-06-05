import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass, LayoutDashboard, Plus, LogOut, ChevronDown,
  Bell, Settings, HelpCircle, User, Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ onNewItinerary }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Avatar gradient based on name
  const gradients = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-rose-500 to-rose-700',
    'from-teal-500 to-teal-700',
    'from-amber-500 to-amber-600',
  ];
  const grad = gradients[(user?.name?.charCodeAt(0) || 0) % gradients.length];

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center h-16 gap-6">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200 group-hover:shadow-blue-300 transition-shadow">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold text-slate-800">Orbitra</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">TRAVEL AI</span>
            </div>
          </Link>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200" />

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            <Link
              to="/dashboard"
              className={isActive('/dashboard') ? 'nav-link-active' : 'nav-link'}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* New Itinerary CTA in navbar */}
          <button
            id="navbar-new-itinerary-btn"
            onClick={onNewItinerary || (() => navigate('/itinerary/create'))}
            className="btn-primary hidden sm:inline-flex"
          >
            <Plus className="w-4 h-4" />
            New Itinerary
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              id="notif-btn"
              onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
              className="relative w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-all"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 border border-white" />
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-modal z-20 overflow-hidden animate-scale-in">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                    <span className="text-sm font-semibold text-slate-700">Notifications</span>
                    <span className="badge-blue">2 new</span>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      { icon: Sparkles, color: 'text-blue-500 bg-blue-50', title: 'AI itinerary ready!', sub: 'Your Tokyo trip plan is complete.', time: '2m ago' },
                      { icon: Compass, color: 'text-emerald-500 bg-emerald-50', title: 'New destination suggestion', sub: 'Based on your trip to Bali…', time: '1h ago' },
                    ].map((n, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50/60 cursor-pointer transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${n.color}`}>
                          <n.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700">{n.title}</p>
                          <p className="text-xs text-slate-400 truncate">{n.sub}</p>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              id="profile-menu-btn"
              onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false); }}
              className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all duration-200"
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                {initials}
              </div>
              <div className="hidden sm:flex flex-col leading-none text-left">
                <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">{user?.name}</span>
                <span className="text-xs text-slate-400">Team Orbitra</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-100 rounded-2xl shadow-modal z-20 overflow-hidden animate-scale-in">
                  {/* Profile header */}
                  <div className="px-4 py-4 border-b border-slate-50 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-sm font-bold text-white`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  {/* Menu items */}
                  <div className="p-2 space-y-0.5">
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                      <User className="w-4 h-4 text-slate-400" /> My Profile
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                      <Settings className="w-4 h-4 text-slate-400" /> Settings
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                      <HelpCircle className="w-4 h-4 text-slate-400" /> Help & Support
                    </button>
                  </div>
                  <div className="p-2 border-t border-slate-50">
                    <button
                      id="logout-btn"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
