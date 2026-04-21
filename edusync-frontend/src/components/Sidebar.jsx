
// edusync-frontend/src/components/Sidebar.jsx
import React, { useState } from 'react';
import {
  LayoutDashboard, Brain, CalendarCheck, BookOpen,
  GraduationCap, Activity, Sparkles, LogOut, ChevronDown,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',      icon: LayoutDashboard, color: 'text-sky-400'     },
  { id: 'quiz',      label: 'Quiz Engine',     icon: Brain,            color: 'text-purple-400'  },
  { id: 'aigen',     label: 'AI Generator',    icon: Sparkles,         color: 'text-indigo-400'  },
  { id: 'scheduler', label: 'Scheduler',       icon: CalendarCheck,    color: 'text-emerald-400' },
  { id: 'notes',     label: 'Notes Hub',       icon: BookOpen,         color: 'text-amber-400'   },
];

const SERVICE_DOTS = [
  { label: 'React',      port: ':3000', color: 'bg-sky-400'     },
  { label: 'Node API',   port: ':5000', color: 'bg-emerald-400' },
  { label: 'Spring API', port: ':8080', color: 'bg-purple-400'  },
];

const ROLE_COLOR = {
  student: 'bg-sky-800 text-sky-300',
  teacher: 'bg-amber-800 text-amber-300',
  admin:   'bg-red-900 text-red-300',
};

function Sidebar({ activeView, setActiveView }) {
  const { user, logout }       = useAuth();
  const [showLogout, setShow]  = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <aside className="w-60 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800">

      {/* ── Brand ── */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display text-sm font-bold text-white leading-none">EduSync</p>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5">FSD Exam Ecosystem</p>
          </div>
        </div>
      </div>

      {/* ── User Card ── */}
      <div className="px-3 py-3 border-b border-slate-800">
        <button
          onClick={() => setShow(s => !s)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md capitalize ${ROLE_COLOR[user?.role] || 'bg-slate-700 text-slate-300'}`}>
              {user?.role}
            </span>
          </div>
          <ChevronDown size={12} className={`text-slate-500 group-hover:text-slate-300 transition-all ${showLogout ? 'rotate-180' : ''}`} />
        </button>

        {showLogout && (
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 mt-1 rounded-xl text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors text-xs font-medium"
          >
            <LogOut size={13} /> Sign Out
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        {NAV_ITEMS.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-100 ${
                isActive
                  ? 'bg-slate-800 text-white ring-1 ring-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon size={16} className={isActive ? color : 'text-slate-600'} />
              {label}
              {/* AI tag for AI Generator */}
              {id === 'aigen' && (
                <span className="ml-auto text-[9px] font-bold bg-indigo-900 text-indigo-400 px-1.5 py-0.5 rounded-md">AI</span>
              )}
              {isActive && id !== 'aigen' && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Services Status ── */}
      <div className="px-4 py-4 border-t border-slate-800">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <Activity size={9} /> Services
        </p>
        <div className="space-y-1.5">
          {SERVICE_DOTS.map(({ label, port, color }) => (
            <div key={port} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse_soft`} />
                <span className="text-[11px] text-slate-400">{label}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-600">{port}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-slate-800">
        <p className="text-[10px] text-slate-700 font-mono">v2.0.0 · EduSync © 2024</p>
      </div>
    </aside>
  );
}

export default Sidebar;