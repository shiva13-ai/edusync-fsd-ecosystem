// edusync-frontend/src/components/NotesHub.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Upload, FileText, Download,
  User, AlertCircle, Loader2, X, CloudUpload,
} from 'lucide-react';

const NODE_API = 'http://localhost:5000';

const SUBJECTS = [
  'React', 'Node.js', 'Java', 'Spring Boot',
  'MongoDB', 'SQL', 'DSA', 'OS', 'CN', 'Other',
];

const SUBJECT_STYLE = {
  'React':       'bg-sky-100 text-sky-700',
  'Node.js':     'bg-emerald-100 text-emerald-700',
  'Java':        'bg-orange-100 text-orange-700',
  'Spring Boot': 'bg-lime-100 text-lime-700',
  'MongoDB':     'bg-teal-100 text-teal-700',
  'DSA':         'bg-purple-100 text-purple-700',
  'OS':          'bg-rose-100 text-rose-700',
  'CN':          'bg-indigo-100 text-indigo-700',
  'SQL':         'bg-yellow-100 text-yellow-700',
  'Other':       'bg-slate-100 text-slate-600',
};

function NoteCard({ note }) {
  const subjectClass = SUBJECT_STYLE[note.subject] || SUBJECT_STYLE['Other'];
  const dateStr = new Date(note.uploadDate).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  function openFile() {
    window.open(note.fileUrl, '_blank', 'noreferrer');
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
          <FileText size={19} className="text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
            {note.title}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={"text-[10px] font-semibold px-2 py-0.5 rounded-full " + subjectClass}>
              {note.subject}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <User size={9} />
              {note.author}
            </span>
          </div>
          <p className="text-[10px] text-slate-300 mt-1">{dateStr}</p>
        </div>
      </div>
      <button
        onClick={openFile}
        className="mt-auto flex items-center justify-center gap-1.5 w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
      >
        <Download size={13} />
        View / Download PDF
      </button>
    </div>
  );
}

function NotesHub() {
  const [notes,     setNotes]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState({ title: '', subject: 'React', author: '' });
  const [pdfFile,   setPdfFile]   = useState(null);
  const [dragOver,  setDragOver]  = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(NODE_API + '/api/notes');
        const data = await res.json();
        setNotes(data);
      } catch {
        setError('Cannot reach Node.js API at localhost:5000');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      setError('Only PDF files are accepted');
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!pdfFile) { setError('Please attach a PDF file'); return; }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title',   form.title);
      fd.append('subject', form.subject);
      fd.append('author',  form.author);
      fd.append('pdf',     pdfFile);
      const res = await fetch(NODE_API + '/api/notes', { method: 'POST', body: fd });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || 'Upload failed');
      }
      const note = await res.json();
      setNotes([note, ...notes]);
      setForm({ title: '', subject: 'React', author: '' });
      setPdfFile(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function cancelForm() {
    setShowForm(false);
    setPdfFile(null);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800">Notes Hub</h2>
          <p className="text-slate-400 text-xs mt-0.5 font-mono">
            {NODE_API}/api/notes · Multer PDF Storage
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm"
        >
          <Upload size={15} />
          Upload Notes
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
          <AlertCircle size={15} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}>
            <X size={13} />
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleUpload}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 animate-fadeIn"
        >
          <p className="font-semibold text-slate-700 text-sm">
            Upload Study Notes (PDF only · max 10 MB)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Note title (e.g. Spring Boot Cheat Sheet)"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
            <input
              type="text"
              placeholder="Your name (author)"
              value={form.author}
              onChange={e => setForm({ ...form, author: e.target.value })}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              required
            />
          </div>

          <select
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {SUBJECTS.map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className={
              'flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ' +
              (dragOver || pdfFile
                ? 'border-amber-400 bg-amber-50'
                : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50')
            }
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={e => setPdfFile(e.target.files[0])}
            />
            {pdfFile ? (
              <div className="text-center px-4">
                <FileText size={22} className="text-amber-500 mx-auto mb-1" />
                <p className="text-sm font-medium text-amber-700 truncate max-w-xs">
                  {pdfFile.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <CloudUpload size={24} className="text-slate-300 mx-auto mb-1" />
                <p className="text-sm text-slate-400">Drag & drop or click to select PDF</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              {uploading ? 'Uploading…' : 'Upload PDF'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <Loader2 size={26} className="animate-spin text-amber-500 mx-auto" />
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center">
          <BookOpen size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium text-sm">No notes uploaded yet</p>
          <p className="text-slate-300 text-xs">Be the first to share study materials!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}

    </div>
  );
}

export default NotesHub;