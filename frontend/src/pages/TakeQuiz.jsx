import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptService } from '../services/attemptService';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
} from 'lucide-react';

const TakeQuiz = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers state: { [questionId]: 'A' | 'B' | 'C' | 'D' }
  const [answers, setAnswers] = useState({});
  // Review flags: Set of questionIds
  const [markedForReview, setMarkedForReview] = useState(new Set());

  // Countdown timer state
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef(null);

  // Submit modal & state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  // Load attempt session from backend
  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await attemptService.getAttemptSession(attemptId);
      if (res.data) {
        const data = res.data;
        setSession(data);
        setRemainingSeconds(data.remainingSeconds);

        if (data.savedAnswers) {
          setAnswers(data.savedAnswers);
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load attempt session.');
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  }, [attemptId, error, navigate]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Final submission routine
  const executeSubmission = useCallback(async (isAutomatic = false) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const res = await attemptService.submitAttempt(attemptId);
      if (isAutomatic) {
        warning('Time expired! Your quiz attempt was automatically submitted.');
      } else {
        success('Quiz submitted successfully!');
      }
      navigate(`/attempts/${attemptId}/result`);
    } catch (err) {
      error(err.response?.data?.message || 'Submission error.');
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
      setSubmitModalOpen(false);
    }
  }, [attemptId, submitting, success, warning, error, navigate]);

  // Ticking countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0 && !loading && session && !autoSubmitted) {
      setAutoSubmitted(true);
      executeSubmission(true);
      return;
    }

    if (remainingSeconds > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [remainingSeconds, loading, session, autoSubmitted, executeSubmission]);

  // Format seconds into HH:MM:SS
  const formatTime = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Handle option select with automatic background saving
  const handleSelectOption = async (optionKey) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    // Toggle off if already selected
    const newOption = answers[qId] === optionKey ? null : optionKey;

    setAnswers((prev) => {
      const next = { ...prev };
      if (newOption === null) {
        delete next[qId];
      } else {
        next[qId] = newOption;
      }
      return next;
    });

    try {
      await attemptService.saveAnswer(attemptId, qId, newOption);
    } catch (err) {
      // ignore or alert
    }
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to secure exam environment..." className="py-20" />;
  }

  const questions = session?.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const reviewCount = markedForReview.size;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Determine timer urgent style (<= 2 minutes)
  const isUrgent = remainingSeconds <= 120;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Fixed Header with Timer & Progress */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 sticky top-16 z-20">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 line-clamp-1">
            {session?.quizTitle}
          </h1>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">{answeredCount} Answered</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm font-bold font-mono transition-colors ${
              isUrgent
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          <button
            onClick={() => setSubmitModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Quiz</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Grid: Question Panel + Palette Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Question & Choices */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[420px]">
          {currentQuestion ? (
            <div className="space-y-6">
              {/* Question Header & Action */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  Question {currentIndex + 1}
                </span>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500 font-medium">
                    +{currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={toggleMarkForReview}
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                      markedForReview.has(currentQuestion.id)
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{markedForReview.has(currentQuestion.id) ? 'Marked' : 'Mark for Review'}</span>
                  </button>
                </div>
              </div>

              {/* Statement */}
              <h2 className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
                {currentQuestion.questionText}
              </h2>

              {/* 4 Multiple Choice Options */}
              <div className="space-y-3 pt-2">
                {[
                  { key: 'A', text: currentQuestion.optionA },
                  { key: 'B', text: currentQuestion.optionB },
                  { key: 'C', text: currentQuestion.optionC },
                  { key: 'D', text: currentQuestion.optionD },
                ].map((opt) => {
                  const isSelected = answers[currentQuestion.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center space-x-3.5 ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950 font-medium shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.key}
                      </div>
                      <span className="text-sm flex-1 leading-snug">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">No question data available.</div>
          )}

          {/* Navigation Controls */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center space-x-1.5 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => setCurrentIndex((idx) => Math.min(totalQuestions - 1, idx + 1))}
              disabled={currentIndex === totalQuestions - 1}
              className="inline-flex items-center space-x-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40 transition"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Question Navigation Palette */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3">Question Palette</h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-slate-200" />
                <span>Not Answered ({unansweredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-amber-400" />
                <span>Marked ({reviewCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md border-2 border-indigo-600" />
                <span>Current</span>
              </div>
            </div>

            {/* Palette Buttons */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = markedForReview.has(q.id);
                const isCurrent = currentIndex === idx;

                let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                if (isMarked) {
                  bgClass = 'bg-amber-400 text-white hover:bg-amber-500';
                } else if (isAnswered) {
                  bgClass = 'bg-emerald-600 text-white hover:bg-emerald-700';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg text-xs font-bold transition flex items-center justify-center relative ${bgClass} ${
                      isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Submit Prompt */}
          <div className="pt-6 mt-6 border-t border-slate-100">
            <button
              onClick={() => setSubmitModalOpen(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
            >
              Finish & Submit Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onConfirm={() => executeSubmission(false)}
        title="Submit Quiz Assessment"
        confirmText="Confirm & Submit"
        cancelText="Review Questions"
        isLoading={submitting}
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-xs leading-relaxed">
            Are you sure you are ready to submit your assessment? Once submitted, answers cannot be edited.
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
              <span className="block font-extrabold text-emerald-700 text-lg">{answeredCount}</span>
              <span className="text-emerald-800 font-medium">Answered</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
              <span className="block font-extrabold text-slate-700 text-lg">{unansweredCount}</span>
              <span className="text-slate-600 font-medium">Unanswered</span>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
              <span className="block font-extrabold text-amber-700 text-lg">{reviewCount}</span>
              <span className="text-amber-800 font-medium">Marked</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TakeQuiz;
