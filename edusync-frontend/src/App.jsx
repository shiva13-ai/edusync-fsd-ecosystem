// edusync-frontend/src/App.jsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar     from './components/Sidebar';
import Dashboard   from './components/Dashboard';
import QuizEngine  from './components/QuizEngine';
import Scheduler   from './components/Scheduler';
import NotesHub    from './components/NotesHub';
import SyllabusAI  from './components/SyllabusAI';
import AuthPage    from './pages/AuthPage';

const VIEWS = {
  dashboard: Dashboard,
  quiz:      QuizEngine,
  scheduler: Scheduler,
  notes:     NotesHub,
  aigen:     SyllabusAI,
};

// ── Inner shell — rendered only when AuthContext is ready ─────────────────────
function AppShell() {
  const { user, loading }                = useAuth();
  const [activeView, setActiveView]      = useState('dashboard');

  // ── Loading (restoring session from localStorage) ──
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse shadow-2xl">
          <span className="text-white text-lg">✦</span>
        </div>
        <p className="text-slate-500 text-sm font-mono">Restoring session…</p>
      </div>
    );
  }

  // ── Unauthenticated ──
  if (!user) return <AuthPage />;

  // ── Authenticated App Shell ──
  const ActiveComponent = VIEWS[activeView] || Dashboard;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 animate-fadeIn" key={activeView}>
          <ActiveComponent setActiveView={setActiveView} />
        </div>
      </main>
    </div>
  );
}

// ── Root — wraps everything in AuthProvider ───────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;