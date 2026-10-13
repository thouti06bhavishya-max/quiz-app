import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptService } from '../services/attemptService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  RotateCcw,
  LayoutDashboard,
  Eye,
  Check,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

// Student Project: Quiz Result Summary Component
const QuizResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attemptService
      .getAttemptResult(attemptId)
      .then((res) => {
        if (res.data) setResult(res.data);
      })
      .catch(() => {
        navigate('/my-attempts');
      })
      .finally(() => setLoading(false));
  }, [attemptId, navigate]);

  if (loading) {
    return <LoadingSpinner text="Calculating your score..." className="py-20" />;
  }

  if (!result) return null;

  const {
    quizId,
    quizTitle,
    score,
    totalMarks,
    passingMarks,
    percentage,
    passed,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unansweredQuestions,
    timeTakenSeconds,
    negativeMarkingEnabled,
    negativeMarksPerWrong,
  } = result;

  const chartData = [
    { name: 'Correct', value: correctAnswers, color: '#10b981' },
    { name: 'Wrong', value: wrongAnswers, color: '#f43f5e' },
    { name: 'Skipped', value: unansweredQuestions, color: '#94a3b8' },
  ].filter((item) => item.value > 0);

  const mins = Math.floor(timeTakenSeconds / 60);
  const secs = timeTakenSeconds % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner Card */}
      <div
        className={`rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 ${
          passed
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : 'bg-gradient-to-r from-rose-600 to-red-700'
        }`}
      >
        <div className="text-center md:text-left space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
            {passed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            <span>{passed ? 'Result: Passed 🎉' : 'Result: Needs Practice 📚'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">{quizTitle}</h1>
          <p className="text-white/90 text-xs sm:text-sm">
            {passed
              ? 'Great job! You achieved the required passing marks.'
              : `You scored ${score} marks. Minimum passing marks required was ${passingMarks}.`}
          </p>
        </div>

        <div className="text-center bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 min-w-[160px]">
          <span className="text-xs uppercase tracking-wider text-white/80 font-bold">Your Score</span>
          <div className="text-3xl font-black mt-1">
            {score} <span className="text-lg font-medium text-white/80">/ {totalMarks}</span>
          </div>
          <span className="text-xs font-bold text-white mt-1 block">
            {percentage}% Marks
          </span>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Correct</p>
          <p className="text-xl font-bold text-slate-800">{correctAnswers}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-1">
            <XCircle className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Incorrect</p>
          <p className="text-xl font-bold text-slate-800">{wrongAnswers}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center mb-1">
            <HelpCircle className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Skipped</p>
          <p className="text-xl font-bold text-slate-800">{unansweredQuestions}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center">
          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Time Taken</p>
          <p className="text-xl font-bold text-slate-800">
            {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
          </p>
        </div>
      </div>

      {/* Breakdown Chart & Details */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-800 text-base mb-4">Question Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} questions`, name]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="font-medium text-slate-500">Total Questions</span>
              <strong className="text-slate-800">{totalQuestions}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="font-medium text-slate-500">Passing Marks Needed</span>
              <strong className="text-slate-800">{passingMarks} Marks</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="font-medium text-slate-500">Negative Marking</span>
              <strong className="text-slate-800">
                {negativeMarkingEnabled ? `Yes (-${negativeMarksPerWrong} marks for wrong)` : 'No'}
              </strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-slate-500">Status</span>
              <strong className={passed ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                {passed ? 'PASSED' : 'FAILED'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          <LayoutDashboard className="w-4 h-4 text-slate-500" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to={`/attempts/${attemptId}/review`}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold border border-indigo-200 transition"
          >
            <Eye className="w-4 h-4" />
            <span>Review Answers</span>
          </Link>

          <Link
            to={`/quizzes/${quizId}/instructions`}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
