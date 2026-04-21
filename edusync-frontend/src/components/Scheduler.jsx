// edusync-frontend/src/components/Scheduler.jsx
import React, { useState, useEffect } from 'react';
import {
  CalendarCheck, Plus, Check, Trash2,
  Clock, AlertCircle, Loader2, SlidersHorizontal,
} from 'lucide-react';

const NODE_API = 'http://localhost:5000';

const SUBJECTS = [
  'React', 'Node.js', 'Java', 'Spring Boot',
  'MongoDB', 'SQL', 'DSA', 'OS', 'CN', 'Other',
];

function Scheduler() {
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [filter,     setFilter]     = useState('all');
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState({ title: '', subject: 'React' });

  // ── Fetch tasks ──
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${NODE_API}/api/tasks`);
        const data = await res.json();
        setTasks(data);
      } catch {
        setError('Cannot reach Node.js API at localhost:5000');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Add task ──
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const res  = await fetch(`${NODE_API}/api/tasks`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const task = await res.json();
      setTasks([task, ...tasks]);
      setForm({ title: '', subject: 'React' });
      setShowForm(false);
    } catch {
      setError('Failed to add task');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle status ──
  const toggleStatus = async (task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    try {
      const res     = await fetch(`${NODE_API}/api/tasks/${task._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setTasks(tasks.map(t => t._id === task._id ? updated : t));
    } catch {
      setError('Failed to update task');
    }
  };

  // ── Delete task ──
  const deleteTask = async (id) => {
    try {
      await fetch(`${NODE_API}/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t._id !== id));
    } catch {
      setError('Failed to delete task');
    }
  };

  const pending   = tasks.filter(t => t.status === 'pending').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const filtered  = tasks.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800">Study Scheduler</h2>
          <p className="text-slate-400 text-xs mt-0.5 font-mono">{NODE_API}/api/tasks</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          <Plus size={15} /> Add Task
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
          <button className="ml-auto text-red-400 hover:text-red-600" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* ── Add Form ── */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3 animate-fadeIn"
        >
          <p className="font-semibold text-slate-700 text-sm">New Study Task</p>
          <input
            type="text"
            placeholder="What do you need to study? (e.g. Spring Boot REST APIs)"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            required
          />
          <select
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              {submitting ? 'Adding…' : 'Add Task'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',     count: tasks.length, bg: 'bg-slate-100',   text: 'text-slate-700' },
          { label: 'Pending',   count: pending,      bg: 'bg-yellow-100',  text: 'text-yellow-700' },
          { label: 'Completed', count: completed,    bg: 'bg-emerald-100', text: 'text-emerald-700' },
        ].map(({ label, count, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-display font-bold ${text}`}>{count}</p>
            <p className={`text-xs font-medium mt-0.5 ${text}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter ── */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={13} className="text-slate-400" />
        {['all', 'pending', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Task List ── */}
      {loading ? (
        <div className="py-16 text-center">
          <Loader2 size={26} className="animate-spin text-emerald-500 mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-14 text-center">
          <CalendarCheck size={32} className="text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 text-sm font-medium">No tasks here</p>
          <p className="text-slate-300 text-xs">Add a task above to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => (
            <div
              key={task._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3.5 flex items-center gap-3 group"
            >
              {/* Toggle Button */}
              <button
                onClick={() => toggleStatus(task)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  task.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-300 hover:border-emerald-400'
                }`}
              >
                {task.status === 'completed' && (
                  <Check size={11} className="text-white" strokeWidth={3} />
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  task.status === 'completed'
                    ? 'line-through text-slate-400'
                    : 'text-slate-700'
                }`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                    {task.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                    <Clock size={9} />
                    {new Date(task.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                task.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-yellow-100 text-yellow-600'
              }`}>
                {task.status}
              </span>

              {/* Delete */}
              <button
                onClick={() => deleteTask(task._id)}
                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all ml-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Scheduler;