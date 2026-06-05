import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Compass, AlertCircle, Loader2, Sparkles, Globe, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try { await login(form.email, form.password); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Login failed. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden items-center justify-center p-12">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3 animate-spin-slow" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />
        <div className="absolute inset-0 text-[250px] font-bold text-white/5 flex items-center justify-center leading-none select-none pointer-events-none">✈</div>

        <div className="relative z-10 text-center animate-float">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Orbitra</h1>
          <p className="text-blue-200 text-lg mb-2 font-medium">Smart Travel Planning by Team Orbitra</p>
          <p className="text-blue-300/80 text-sm max-w-xs mx-auto leading-relaxed mb-8">
            Transform travel documents into beautiful, AI-powered itineraries in seconds.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Sparkles, label: 'AI-Powered' },
              { icon: Globe,    label: 'Any Destination' },
              { icon: Zap,      label: 'Instant Plans' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <Icon className="w-5 h-5 text-blue-200 mx-auto mb-1" />
                <p className="text-xs text-blue-200 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Orbitra</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-400 mb-8">Sign in to continue planning your adventures</p>

          <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="input-label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="login-email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange} placeholder="you@example.com"
                  className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="login-password" name="password" type={showPw ? 'text' : 'password'} autoComplete="current-password"
                  value={form.password} onChange={handleChange} placeholder="••••••••"
                  className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <button id="login-submit-btn" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
