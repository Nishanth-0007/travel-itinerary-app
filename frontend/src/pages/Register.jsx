import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Compass, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StrengthBar = ({ password }) => {
  const checks = [
    { ok: password.length >= 8,    label: '8+ chars' },
    { ok: /[A-Z]/.test(password),  label: 'Uppercase' },
    { ok: /\d/.test(password),     label: 'Number' },
  ];
  const score = checks.filter((c) => c.ok).length;
  if (!password) return null;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-emerald-400'];
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1.5">
        {[0,1,2].map((i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score-1] : 'bg-slate-200'}`} />)}
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span key={c.label} className={`flex items-center gap-1 text-xs font-medium ${c.ok ? 'text-emerald-500' : 'text-slate-400'}`}>
            <CheckCircle className="w-3 h-3" /> {c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!form.email) return 'Email is required.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try { await register(form.name.trim(), form.email, form.password); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-800 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3 animate-spin-slow" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 text-center animate-float">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Join Team Orbitra</h1>
          <p className="text-blue-200 text-sm max-w-xs mx-auto leading-relaxed mb-8">
            Create an account and start planning smarter trips with AI.
          </p>
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              '📄 Upload travel docs & PDFs',
              '🤖 AI extracts your trip details',
              '🗓️ Get a beautiful day-by-day plan',
              '📅 Toggle timeline & calendar views',
              '📸 Add photos & maps to activities',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
                <span className="text-sm text-white/90">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Orbitra</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-800 mb-1">Create account</h2>
          <p className="text-slate-400 mb-8">Free forever · No credit card required</p>

          <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="input-label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="register-name" name="name" type="text" autoComplete="name"
                  value={form.name} onChange={handleChange} placeholder="Jane Smith"
                  className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label htmlFor="register-email" className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="register-email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={handleChange} placeholder="jane@example.com"
                  className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label htmlFor="register-password" className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="register-password" name="password" type={showPw ? 'text' : 'password'}
                  autoComplete="new-password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <StrengthBar password={form.password} />
            </div>
            <div>
              <label htmlFor="register-confirm" className="input-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="register-confirm" name="confirm" type={showPw ? 'text' : 'password'}
                  autoComplete="new-password" value={form.confirm} onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-field pl-10 ${form.confirm && form.confirm !== form.password ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`} />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            <button id="register-submit-btn" type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
