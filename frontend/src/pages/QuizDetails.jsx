import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Clock,
  HelpCircle,
  Award,
  AlertTriangle,
  Play,
  Edit3,
  ListOrdered,
  Users,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Share2,
} from 'lucide-react';

const QuizDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    quizService.getQuizById(id)
      .then((res) => {
        if (res.data) setQuiz(res.data);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'Failed to load quiz details.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading quiz overview..." className="py-20" />;
  }

  if (errorMsg || !quiz) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Quiz Unavailable</h3>
        <p className="text-sm text-slate-500 mt-1 mb-6">{errorMsg || 'Quiz not found.'}</p>
        <Link
          to="/quizzes"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quizzes</span>
        </Link>
      </div>
    );
  }

  const isCreator = user && quiz.creator && user.id === quiz.creator.id;
  const isPublished = quiz.status === 'PUBLISHED';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to="/quizzes"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Quizzes</span>
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-700 to-blue-800 p-6 md:p-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 backdrop-blur-md text-indigo-200 border border-indigo-400/30">
              {quiz.category?.name || 'General'}
            </span>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                quiz.difficulty === 'EASY'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : quiz.difficulty === 'HARD'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {quiz.difficulty}
              </span>
              {isCreator && (
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  isPublished ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
                }`}>
                  {quiz.status}
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{quiz.title}</h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {quiz.description || 'No detailed description provided.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-4 border-t border-white/10">
            <span>
              Created by <strong className="text-white">{quiz.creator?.fullName || 'User'}</strong>
            </span>
            <span>•</span>
            <span>{quiz.attemptsCount || 0} attempts taken</span>
            <span>•</span>
            <span>Updated {new Date(quiz.updatedAt || quiz.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Core Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200 text-center">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <Clock className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
            <p className="text-xs text-slate-400 font-semibold uppercase">Duration</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{quiz.durationMinutes} Minutes</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <HelpCircle className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
            <p className="text-xs text-slate-400 font-semibold uppercase">Questions</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{quiz.questionCount || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <Award className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Marks</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{quiz.totalMarks || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <p className="text-xs text-slate-400 font-semibold uppercase">Passing Marks</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{quiz.passingMarks || 0}</p>
          </div>
        </div>

        {/* Detailed Guidelines & Rules */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">Scoring & Attempt Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct Answers</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Each question awards the configured question marks when answered accurately.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  {quiz.negativeMarkingEnabled ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Negative Marking</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {quiz.negativeMarkingEnabled
                    ? `Enabled: Each wrong answer will deduct ${quiz.negativeMarksPerWrong} marks. Unanswered questions do not incur penalties.`
                    : 'Disabled: Incorrect answers do not incur any score penalties.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            {isCreator ? (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to={`/quizzes/${quiz.id}/edit`}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Quiz</span>
                </Link>
                <Link
                  to={`/quizzes/${quiz.id}/questions`}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Manage Questions ({quiz.questionCount})</span>
                </Link>
              </div>
            ) : <div />}

            <div className="flex items-center space-x-3">
              {isPublished ? (
                <Link
                  to={`/quizzes/${quiz.id}/instructions`}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Quiz Attempt</span>
                </Link>
              ) : (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                  Quiz is currently in draft mode
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetails;
