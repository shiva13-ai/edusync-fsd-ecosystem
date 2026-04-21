// edusync-frontend/src/components/SyllabusAI.jsx
import React, { useState } from 'react';
import {
  Sparkles, ChevronDown, ChevronUp, Check,
  Save, RefreshCw, Loader2, AlertCircle,
  CheckCircle, Zap, BookOpen, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NODE_API = 'http://localhost:5000';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];
const OPTION_KEYS  = ['optionA', 'optionB', 'optionC', 'optionD'];
const OPTION_LABEL = { optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'D' };

const DIFF_STYLE = {
  Easy:   'bg-emerald-100 text-emerald-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  Hard:   'bg-red-100 text-red-600',
  Mixed:  'bg-blue-100 text-blue-700',
};

const SAMPLE = `Unit 1: Spring Boot Fundamentals
- Auto-configuration, starter POMs, @SpringBootApplication
- Embedded servers (Tomcat, Jetty, Undertow)
- application.properties / YAML configuration
- Profiles (@Profile, spring.profiles.active)

Unit 2: RESTful API Design with Spring Web
- @RestController, @RequestMapping, @PathVariable, @RequestParam
- @RequestBody, @ResponseBody, ResponseEntity<T>
- HTTP status codes (2xx, 4xx, 5xx)
- Global exception handling: @ControllerAdvice, @ExceptionHandler

Unit 3: Spring Data MongoDB
- MongoRepository CRUD methods
- @Document, @Id, @Field annotations
- Custom derived query methods
- MongoTemplate for complex queries

Unit 4: Microservices Concepts
- Service discovery and registration
- API Gateway pattern
- Inter-service communication (REST vs messaging)
- Circuit breaker pattern (Resilience4j)`;

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepBadge({ step }) {
  const steps = ['Configure', 'Generate', 'Review & Save'];
  const idx   = { form: 0, generating: 1, preview: 2, saved: 2 }[step] ?? 0;
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-1.5 text-xs font-medium ${i === idx ? 'text-indigo-600' : i < idx ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === idx ? 'bg-indigo-600 text-white' : i < idx ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {i < idx ? '✓' : i + 1}
            </span>
            <span className="hidden sm:inline">{s}</span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-px max-w-8 ${i < idx ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function SyllabusAI() {
  const { token }                   = useAuth();
  const [step, setStep]             = useState('form');
  const [questions, setQuestions]   = useState([]);
  const [meta, setMeta]             = useState(null);
  const [saving, setSaving]         = useState(false);
  const [saveResults, setSaveResults] = useState(null);
  const [error, setError]           = useState('');
  const [expandedQ, setExpandedQ]   = useState(null);
  const [selectedQs, setSelectedQs] = useState(new Set());

  const [form, setForm] = useState({
    subject:                '',
    syllabusText:           '',
    questionCount:          10,
    difficultyLevel:        'Medium',
    additionalInstructions: '',
  });

  const upd = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // ── Generate ──
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.syllabusText.trim()) {
      setError('Subject and syllabus content are required');
      return;
    }
    setStep('generating');
    setError('');

    try {
      const res  = await fetch(`${NODE_API}/api/quizgen/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Generation failed');

      setQuestions(data.questions);
      setMeta(data.meta);
      setSelectedQs(new Set(data.questions.map((_, i) => i))); // select all by default
      setStep('preview');
    } catch (err) {
      setError(err.message);
      setStep('form');
    }
  };

  // ── Save to Quiz Bank ──
  const handleSave = async () => {
    const toSave = questions.filter((_, i) => selectedQs.has(i));
    if (!toSave.length) { setError('Select at least one question to save'); return; }
    setSaving(true);
    setError('');

    try {
      const res  = await fetch(`${NODE_API}/api/quizgen/save-to-bank`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ questions: toSave }),
      });
      const data = await res.json();
      setSaveResults(data);
      if (data.saved > 0) setStep('saved');
      else throw new Error(data.message || 'All saves failed');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleQ    = (idx) => setSelectedQs(prev => { const s = new Set(prev); s.has(idx) ? s.delete(idx) : s.add(idx); return s; });
  const selectAll  = () => setSelectedQs(new Set(questions.map((_, i) => i)));
  const selectNone = () => setSelectedQs(new Set());
  const resetForm  = () => { setStep('form'); setQuestions([]); setMeta(null); setSaveResults(null); setError(''); setForm({ subject: '', syllabusText: '', questionCount: 10, difficultyLevel: 'Medium', additionalInstructions: '' }); };

  // ─────────────────────────────────────────────────────── FORM
  if (step === 'form') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-500" />
              AI Quiz Generator
            </h2>
            <p className="text-slate-400 text-xs mt-0.5 font-mono">claude-3-5-sonnet · {NODE_API}/api/quizgen</p>
          </div>
          <StepBadge step={step} />
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={14} className="shrink-0" />{error}
            <button className="ml-auto" onClick={() => setError('')}><X size={13} /></button>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-5">

          {/* Subject + Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Subject / Course Name *</label>
              <input
                type="text"
                placeholder="e.g. Spring Boot, Data Structures, React…"
                value={form.subject}
                onChange={upd('subject')}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Difficulty Level</label>
              <div className="grid grid-cols-4 gap-1.5">
                {DIFFICULTIES.map(d => (
                  <button
                    key={d} type="button"
                    onClick={() => setForm(f => ({ ...f, difficultyLevel: d }))}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                      form.difficultyLevel === d
                        ? `${DIFF_STYLE[d]} border-current`
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Question Count Slider */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
              <span>Number of Questions</span>
              <span className="text-indigo-600 text-sm font-bold normal-case">{form.questionCount}</span>
            </label>
            <input
              type="range" min="3" max="20" step="1"
              value={form.questionCount}
              onChange={e => setForm(f => ({ ...f, questionCount: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              {[3,5,8,10,15,20].map(n => <span key={n}>{n}</span>)}
            </div>
          </div>

          {/* Syllabus Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Syllabus / Topics *</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, syllabusText: SAMPLE }))} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1">
                <BookOpen size={11} /> Load sample
              </button>
            </div>
            <textarea
              placeholder={`Paste your syllabus, lecture notes, topics, or any content…\n\nExample:\nUnit 1: REST API Design\n- HTTP methods and status codes\n- Request/Response lifecycle`}
              value={form.syllabusText}
              onChange={upd('syllabusText')}
              rows={10}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y font-mono leading-relaxed"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">{form.syllabusText.length} chars · More detail = better, more targeted questions</p>
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
              Additional Instructions <span className="text-slate-400 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Focus on practical code scenarios, include annotation-based questions…"
              value={form.additionalInstructions}
              onChange={upd('additionalInstructions')}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Info Box */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-700 space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5"><Zap size={12} /> How it works</p>
            <p>① Your syllabus is sent (auth-protected) to the Node.js API</p>
            <p>② Gemini (<span className="font-mono">{process.env.REACT_APP_GEMINI_MODEL || 'gemini-1.5-flash'}</span>) generates {form.questionCount} MCQs at <strong>{form.difficultyLevel}</strong> difficulty</p>
            <p>③ Preview all questions, select which to keep, then save to the Spring Boot Quiz Bank</p>
            <p>④ Questions become instantly available in the Quiz Engine</p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 text-sm"
          >
            <Sparkles size={16} />
            Generate {form.questionCount} Questions with Claude AI
          </button>
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────── GENERATING
  if (step === 'generating') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-14 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-purple-100 border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <Sparkles size={22} className="absolute inset-0 m-auto text-indigo-600" />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-800 mb-2">Claude is thinking…</h3>
          <p className="text-slate-500 text-sm">
            Generating <strong className="text-indigo-600">{form.questionCount}</strong> {form.difficultyLevel} questions for
          </p>
          <p className="text-slate-700 font-semibold mt-0.5">"{form.subject}"</p>
          <p className="text-slate-400 text-xs font-mono mt-3">claude-3-5-sonnet-20241022</p>
          <div className="mt-6 space-y-2">
            {['📚 Analyzing syllabus structure…', `🧠 Generating ${form.questionCount} unique questions…`, '✅ Validating answer correctness…', '🎯 Finalizing question options…'].map((msg, i) => (
              <p key={i} className="text-xs text-slate-400 animate-pulse" style={{ animationDelay: `${i * 0.4}s` }}>{msg}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────── SAVED
  if (step === 'saved') {
    return (
      <div className="max-w-xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-md">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-800">Saved to Quiz Bank!</h2>
          <div className="flex justify-center gap-6 mt-5">
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-emerald-600">{saveResults?.saved}</p>
              <p className="text-xs text-slate-400 mt-1">Saved</p>
            </div>
            {saveResults?.failed > 0 && (
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-red-500">{saveResults.failed}</p>
                <p className="text-xs text-slate-400 mt-1">Failed</p>
              </div>
            )}
          </div>
          <p className="text-slate-400 text-xs mt-4 font-mono">Now available in Quiz Engine → Start Quiz</p>
          <div className="flex gap-3 mt-7">
            <button onClick={resetForm} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              <RefreshCw size={14} /> New Generation
            </button>
            <button onClick={() => setStep('preview')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-3 rounded-xl text-sm transition-colors">
              View Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────── PREVIEW
  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fadeIn">

      {/* Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              {questions.length} Questions Generated
            </h2>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {meta && <>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{meta.subject}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${DIFF_STYLE[meta.difficultyLevel] || 'bg-slate-100 text-slate-600'}`}>{meta.difficultyLevel}</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">{meta.model}</span>
              </>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StepBadge step={step} />
            <button onClick={() => setStep('form')} className="flex items-center gap-1 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs px-3 py-2 rounded-xl transition-colors">
              <RefreshCw size={11} /> Regenerate
            </button>
          </div>
        </div>

        {/* Bulk select controls */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500"><strong className="text-indigo-600">{selectedQs.size}</strong> of {questions.length} selected</span>
          <div className="flex gap-3">
            <button onClick={selectAll}  className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">Select All</button>
            <span className="text-slate-300">·</span>
            <button onClick={selectNone} className="text-xs text-slate-400 hover:text-slate-600 font-medium">Clear</button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={14} /> {error}
          <button className="ml-auto" onClick={() => setError('')}><X size={13} /></button>
        </div>
      )}

      {/* Question Cards */}
      <div className="space-y-2.5">
        {questions.map((q, idx) => {
          const isOpen     = expandedQ === idx;
          const isSelected = selectedQs.has(idx);
          return (
            <div key={idx} className={`bg-white rounded-2xl border-2 shadow-sm transition-all ${isSelected ? 'border-indigo-200' : 'border-slate-100'}`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleQ(idx)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 hover:border-indigo-400'}`}
                  >
                    {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">Q{idx + 1}</span>
                      <span className="text-[10px] bg-purple-100 text-purple-600 font-semibold px-2 py-0.5 rounded-full">{q.topic}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${DIFF_STYLE[q.difficultyLevel] || 'bg-slate-100 text-slate-600'}`}>{q.difficultyLevel}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{q.questionText}</p>
                  </div>

                  {/* Expand toggle */}
                  <button onClick={() => setExpandedQ(isOpen ? null : idx)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Options — expanded */}
                {isOpen && (
                  <div className="mt-3 ml-8 space-y-2">
                    {OPTION_KEYS.map(key => {
                      const isCorrect = q.correctAnswer === key;
                      return (
                        <div key={key} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {OPTION_LABEL[key]}
                          </span>
                          <span className="flex-1">{q[key]}</span>
                          {isCorrect && <Check size={12} className="text-emerald-500 shrink-0" strokeWidth={3} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Save Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-4 flex items-center justify-between gap-4 sticky bottom-4 z-10">
        <p className="text-xs text-slate-500">
          Saving <strong className="text-indigo-600">{selectedQs.size}</strong> questions →
          <span className="font-mono"> Spring Boot :8080</span>
        </p>
        <button
          onClick={handleSave}
          disabled={saving || selectedQs.size === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Saving…' : `Save ${selectedQs.size} to Quiz Bank`}
        </button>
      </div>
    </div>
  );
}

export default SyllabusAI;