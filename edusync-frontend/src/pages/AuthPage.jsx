// edusync-frontend/src/pages/AuthPage.jsx
import React, { useState } from 'react';
import {
  GraduationCap, Eye, EyeOff, AlertCircle,
  Loader2, User, Mail, Lock, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NODE_API = 'http://localhost:5000';

const ROLE_OPTIONS = [
  { value: 'student', label: '🎓 Student',  desc: 'Take quizzes & track study tasks' },
  { value: 'teacher', label: '📚 Teacher',  desc: 'Generate AI questions from your syllabus' },
];

function AuthPage() {
  const { login }                   = useAuth();
  const [mode, setMode]             = useState('login'); // login | register
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [form, setForm]             = useState({
    name: '', email: '', password: '', role: 'student',
  });

  const update = (field) => (e) => {
    setError('');
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload  = mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password, role: form.role };

    try {
      const res  = await fetch(`${NODE_API}${endpoint}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');
      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setForm({ name: '', email: '', password: '', role: 'student' });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-900/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-900/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeIn">

        {/* ── Brand Header ── */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/30">
            <GraduationCap size={30} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">EduSync</h1>
          <p className="text-slate-400 text-sm mt-1">FSD Exam Ecosystem</p>
        </div>

        {/* ── Card ── */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-7 shadow-2xl">

          {/* Tab Toggle */}
          <div className="flex bg-slate-800/80 rounded-xl p-1 mb-6 gap-1">
            {[
              { id: 'login',    label: 'Sign In' },
              { id: 'register', label: 'Create Account' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => switchMode(id)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* Name — register only */}
            {mode === 'register' && (
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={update('name')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  required
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={update('email')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Password (min. 6 characters)' : 'Password'}
                value={form.password}
                onChange={update('password')}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Role selector — register only */}
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: value }))}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      form.role === value
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/50 text-red-400 rounded-xl px-3.5 py-2.5 text-sm">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-1 shadow-lg shadow-indigo-500/20"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Please wait…</>
                : <><ShieldCheck size={15} /> {mode === 'login' ? 'Sign In to EduSync' : 'Create My Account'}</>
              }
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-slate-500 text-xs mt-5">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              {mode === 'login' ? 'Register free' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-[11px] mt-5 font-mono">
          React · Node.js · Spring Boot · MongoDB · Claude AI
        </p>
      </div>
    </div>
  );
}

export default AuthPage;