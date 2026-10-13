import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { attemptService } from '../services/attemptService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Play,
  ArrowLeft,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

const QuizInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    quizService.getQuizById(id)
      .then((res) => {
        if (res.data) setQuiz(res.data);
      })
      .catch((err) => {
        error(err.response?.data?.message || 'Failed to load quiz instructions.');
        navigate('/quizzes');
      })
      .finally(() => setLoading(false));
  }, [id, navigate, error]);

  const handleStartAttempt = async () => {
    if (!agreed) {
      error('Please acknowledge the examination guidelines before starting.');
      return;
    }

    try {
      setStarting(true);
      const res = await attemptService.startAttempt(id);
      if (res.data?.attemptId) {
        navigate(`/attempts/${res.data.attemptId}/take`);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Could not start quiz attempt.');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Preparing instructions..." className="py-20" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <Link
          to={`/quizzes/${id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Quiz Overview</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-900 p-6 md:p-8 text-white">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
            Quiz Guidelines & Rules
          </span>
          <h1 className="text-2xl font-extrabold mt-3">{quiz?.title}</h1>
          <p className="text-xs text-indigo-200 mt-1">
            Please read the instructions below before starting your test.
          </p>
        </div>

        {/* Quick Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 border-b border-slate-200 text-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Duration</span>
            <p className="text-base font-bold text-slate-800">{quiz?.durationMinutes} Mins</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Questions</span>
            <p className="text-base font-bold text-slate-800">{quiz?.questionCount || 0}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Marks</span>
            <p className="text-base font-bold text-slate-800">{quiz?.totalMarks || 0}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase">Passing Score</span>
            <p className="text-base font-bold text-slate-800">{quiz?.passingMarks || 0}</p>
          </div>
        </div>

        {/* Instructions Body */}
        <div className="p-6 md:p-8 space-y-5 text-sm text-slate-600 leading-relaxed">
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-base">Key Rules & Regulations:</h3>
            <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-slate-600">
              <li>
                <strong>Server-Enforced Timer:</strong> The timer begins the moment you press "Start Quiz". The server records the deadline and does not extend time if you refresh the browser.
              </li>
              <li>
                <strong>Automatic Submission:</strong> When the remaining countdown hits 00:00:00, your current answers will be automatically submitted and scored on the server.
              </li>
              <li>
                <strong>Progress Persistence:</strong> Your answers are saved automatically each time you select an option. If your internet disconnects temporarily, you can resume until the deadline expires.
              </li>
              <li>
                <strong>Scoring Calculation:</strong>
                {quiz?.negativeMarkingEnabled ? (
                  <span className="text-amber-800 font-semibold block mt-1 pl-4">
                    ⚠️ Negative Marking is ENABLED. Wrong answers deduct {quiz.negativeMarksPerWrong} marks. Unanswered questions award 0 marks.
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold block mt-1 pl-4">
                    ✓ Negative Marking is DISABLED. Wrong answers do not deduct marks.
                  </span>
                )}
              </li>
              <li>
                <strong>Submission Finality:</strong> Once submitted manually or automatically, you cannot alter answers or re-enter the session.
              </li>
            </ul>
          </div>

          {/* Acknowledgement Checkbox */}
          <div className="pt-4 border-t border-slate-100">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mt-0.5 border-slate-300"
              />
              <span className="text-xs text-slate-700 font-medium">
                I have read and understood all the quiz instructions and examination conditions. I am ready to start my timer.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between">
            <Link
              to={`/quizzes/${id}`}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              onClick={handleStartAttempt}
              disabled={!agreed || starting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {starting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Starting Session...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Begin Quiz Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInstructions;
