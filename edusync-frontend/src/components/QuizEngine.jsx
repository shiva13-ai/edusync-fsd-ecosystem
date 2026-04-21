// edusync-frontend/src/components/QuizEngine.jsx
import React, { useState, useCallback } from 'react';
import {
  Brain, RefreshCw, CheckCircle, XCircle,
  Trophy, ChevronRight, Loader2, AlertCircle, Cpu,
} from 'lucide-react';

const SPRING_API = 'http://localhost:8090';

const OPTION_KEYS  = ['optionA', 'optionB', 'optionC', 'optionD'];
const OPTION_LABEL = { optionA: 'A', optionB: 'B', optionC: 'C', optionD: 'D' };

function QuizEngine() {
  const [questions,      setQuestions]      = useState([]);
  const [currentIndex,   setCurrentIndex]   = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers,        setAnswers]        = useState([]);
  const [quizState,      setQuizState]      = useState('idle'); // idle|loading|active|complete
  const [error,          setError]          = useState('');

  // ── Fetch questions from Spring Boot ──
  const startQuiz = useCallback(async () => {
    setQuizState('loading');
    setError('');
    try {
      const res = await fetch(`${SPRING_API}/api/quiz/random?count=10`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setQuestions(data);
      setCurrentIndex(0);
      setSelectedAnswer('');
      setAnswers([]);
      setQuizState('active');
    } catch (err) {
      setError(err.message);
      setQuizState('idle');
    }
  }, []);

  const handleNext = () => {
    const q = questions[currentIndex];
    const entry = {
      selected:  selectedAnswer,
      correct:   q.correctAnswer,
      isCorrect: selectedAnswer === q.correctAnswer,
    };
    const newAnswers = [...answers, entry];
    setAnswers(newAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer('');
    } else {
      setQuizState('complete');
    }
  };

  const score      = answers.filter(a => a.isCorrect).length;
  const totalCount = questions.length;

  // ────────────────────────────────────────────────────────────────────────────
  // IDLE
  // ────────────────────────────────────────────────────────────────────────────
  if (quizState === 'idle') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Brain size={30} className="text-white" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-800 mb-2">Quiz Engine</h2>
          <p className="text-slate-500 text-sm mb-1">10 randomized questions · Powered by Spring Boot</p>
          <p className="font-mono text-xs text-slate-400 mb-7">GET {SPRING_API}/api/quiz/random</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm text-left">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-sm"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // LOADING
  // ────────────────────────────────────────────────────────────────────────────
  if (quizState === 'loading') {
    return (
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <Loader2 size={36} className="text-purple-500 animate-spin mx-auto mb-4" />
          <p className="font-semibold text-slate-700">Fetching questions…</p>
          <p className="text-xs text-slate-400 mt-1 font-mono">{SPRING_API}/api/quiz/random</p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // COMPLETE
  // ────────────────────────────────────────────────────────────────────────────
  if (quizState === 'complete') {
    const pct   = Math.round((score / totalCount) * 100);
    const grade = pct >= 80 ? { text: 'Excellent!', color: 'text-emerald-600' }
                : pct >= 60 ? { text: 'Good Job!',  color: 'text-yellow-600'  }
                :             { text: 'Keep Going!', color: 'text-red-500'     };

    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">

        {/* Score Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-yellow-500" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-800">Quiz Complete!</h2>
          <p className={`text-base font-semibold mt-1 ${grade.color}`}>{grade.text}</p>

          <div className="flex justify-center gap-10 mt-6">
            <div>
              <p className="text-3xl font-display font-bold text-slate-800">{score}/{totalCount}</p>
              <p className="text-xs text-slate-400 mt-1">Score</p>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-slate-800">{pct}%</p>
              <p className="text-xs text-slate-400 mt-1">Percentage</p>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="mt-6 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            <RefreshCw size={14} /> Retake Quiz
          </button>
        </div>

        {/* Review */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Answer Review</h3>
          <div className="space-y-2.5">
            {questions.map((q, i) => {
              const a = answers[i];
              return (
                <div
                  key={q.id || i}
                  className={`rounded-xl p-3.5 border text-sm ${
                    a?.isCorrect
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {a?.isCorrect
                      ? <CheckCircle size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                      : <XCircle    size={15} className="text-red-500 mt-0.5 shrink-0" />
                    }
                    <div>
                      <p className="font-medium text-slate-700">{q.questionText}</p>
                      <div className="mt-1 text-xs space-y-0.5">
                        <p className="text-slate-500">
                          Your answer:{' '}
                          <span className={a?.isCorrect ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                            {OPTION_LABEL[a?.selected]}: {q[a?.selected]}
                          </span>
                        </p>
                        {!a?.isCorrect && (
                          <p className="text-slate-500">
                            Correct:{' '}
                            <span className="text-emerald-600 font-medium">
                              {OPTION_LABEL[a?.correct]}: {q[a?.correct]}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ACTIVE QUIZ
  // ────────────────────────────────────────────────────────────────────────────
  const current  = questions[currentIndex];
  const progress = (currentIndex / totalCount) * 100;
  const isLast   = currentIndex + 1 === totalCount;

  const diffColor = {
    Easy:   'bg-emerald-100 text-emerald-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard:   'bg-red-100 text-red-600',
  }[current.difficultyLevel] || 'bg-slate-100 text-slate-600';

  return (
    <div className="max-w-xl mx-auto space-y-4 animate-fadeIn">

      {/* Progress Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Cpu size={12} />
            <span className="font-mono">Spring Boot · {SPRING_API}</span>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {currentIndex + 1} / {totalCount}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <h3 className="text-base font-semibold text-slate-800 leading-relaxed">
            {current.questionText}
          </h3>
          <div className="flex flex-col gap-1.5 shrink-0">
            <span className="text-[10px] bg-purple-100 text-purple-600 font-medium px-2 py-0.5 rounded-md text-center">
              {current.topic}
            </span>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md text-center ${diffColor}`}>
              {current.difficultyLevel}
            </span>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {OPTION_KEYS.map((key) => {
            const isSelected = selectedAnswer === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedAnswer(key)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 text-purple-800'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isSelected ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {OPTION_LABEL[key]}
                </span>
                <span>{current[key]}</span>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm"
        >
          {isLast ? 'Finish Quiz' : 'Next Question'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default QuizEngine;