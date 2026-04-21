// edusync-frontend/src/components/Dashboard.jsx
import React from 'react';
import {
  Brain,
  CalendarCheck,
  BookOpen,
  Layers,
  Database,
  Server,
  Monitor,
  ArrowRight,
  Zap,
} from 'lucide-react';

const FEATURE_CARDS = [
  {
    view: 'quiz',
    icon: Brain,
    label: 'Quiz Engine',
    desc: '10 randomized MCQs per session via Spring Boot API',
    accent: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100',
    iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    badge: ':8080',
    badgeColor: 'bg-purple-100 text-purple-600',
  },
  {
    view: 'scheduler',
    icon: CalendarCheck,
    label: 'Study Scheduler',
    desc: 'CRUD-based task manager powered by Node.js REST API',
    accent: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    badge: ':5000',
    badgeColor: 'bg-emerald-100 text-emerald-600',
  },
  {
    view: 'notes',
    icon: BookOpen,
    label: 'Notes Hub',
    desc: 'PDF upload & collaborative notes via Multer storage',
    accent: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    badge: ':5000',
    badgeColor: 'bg-amber-100 text-amber-600',
  },
];

const ARCH_LAYERS = [
  {
    icon: Monitor,
    name: 'React Frontend',
    port: 'localhost:3000',
    tech: 'Tailwind CSS · lucide-react',
    color: 'border-l-sky-500',
    bg: 'bg-sky-50',
  },
  {
    icon: Server,
    name: 'Node.js API',
    port: 'localhost:5000',
    tech: 'Express · Mongoose · Multer',
    color: 'border-l-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Layers,
    name: 'Spring Boot API',
    port: 'localhost:8080',
    tech: 'Java 17 · Spring Data MongoDB',
    color: 'border-l-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: Database,
    name: 'MongoDB',
    port: 'localhost:27017',
    tech: 'edusync · edusync_quiz',
    color: 'border-l-amber-500',
    bg: 'bg-amber-50',
  },
];

function Dashboard({ setActiveView }) {
  return (
    <div className="space-y-8">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 50%, #6366f1 0%, transparent 60%),
                              radial-gradient(circle at 20% 80%, #8b5cf6 0%, transparent 50%)`,
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-indigo-400" />
            <span className="text-xs font-mono text-indigo-400 tracking-wide">MICROSERVICES · FULL STACK</span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-1">Welcome to EduSync</h1>
          <p className="text-slate-300 text-sm max-w-md">
            Your all-in-one FSD exam prep platform. Three microservices, one seamless experience.
          </p>
        </div>
      </div>

      {/* ── Feature Cards ── */}
      <div>
        <h2 className="font-display text-base font-semibold text-slate-700 mb-4">Jump Right In</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURE_CARDS.map(({ view, icon: Icon, label, desc, bg, border, iconBg, badge, badgeColor }) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`text-left ${bg} ${border} border rounded-2xl p-5 hover:shadow-md transition-all group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${iconBg} w-10 h-10 rounded-xl flex items-center justify-center shadow`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-1 rounded-md ${badgeColor}`}>
                  {badge}
                </span>
              </div>
              <p className="font-semibold text-slate-800 text-sm mb-1">{label}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
              <div className="flex items-center gap-1 mt-4 text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                Open <ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Architecture Layers ── */}
      <div>
        <h2 className="font-display text-base font-semibold text-slate-700 mb-4">Architecture Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ARCH_LAYERS.map(({ icon: Icon, name, port, tech, color, bg }) => (
            <div key={name} className={`${bg} border-l-4 ${color} rounded-r-xl px-4 py-3.5 flex items-center gap-4`}>
              <Icon size={18} className="text-slate-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-700">{name}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">{port}</p>
                <p className="text-[11px] text-slate-400">{tech}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;