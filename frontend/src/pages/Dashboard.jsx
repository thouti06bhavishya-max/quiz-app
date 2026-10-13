import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import StatCard from '../components/StatCard';
import QuizCard from '../components/QuizCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BookOpen,
  Award,
  CheckCircle,
  TrendingUp,
  PlusCircle,
  Compass,
  History,
  ArrowRight,
  Clock,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

// Student Project: Main Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch {
      // error handled
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." className="py-20" />;
  }

  const {
    totalQuizzesCreated = 0,
    totalQuizzesAttempted = 0,
    averageScore = 0,
    highestScore = 0,
    recentAttempts = [],
    recentlyCreatedQuizzes = [],
    availableQuizzes = [],
    performanceTrends = [],
  } = stats || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome to QuizMaster!
          </h1>
          <p className="text-blue-100 text-sm mt-2 leading-relaxed">
            Create quizzes, practice questions across various topics, and track your scores.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/quizzes/create"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-blue-50 font-bold text-sm shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Quiz</span>
          </Link>
          <Link
            to="/quizzes"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/50 text-white font-bold text-sm backdrop-blur-sm border border-white/20 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Quizzes</span>
          </Link>
        </div>
      </div>

      {/* 4 Simple Student Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Quizzes Created"
          value={totalQuizzesCreated}
          subtitle="Created by you"
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Quizzes Attempted"
          value={totalQuizzesAttempted}
          subtitle="Tests completed"
          icon={History}
          color="emerald"
        />
        <StatCard
          title="Average Marks"
          value={Number(averageScore).toFixed(1)}
          subtitle="Your average score"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Highest Score"
          value={Number(highestScore).toFixed(1)}
          subtitle="Your personal best"
          icon={Award}
          color="violet"
        />
      </div>

      {/* Student Score Trends Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Quiz Scores</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your score progress over recent attempts</p>
          </div>
          {performanceTrends.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              Score History
            </span>
          )}
        </div>

        {performanceTrends.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val, name, props) => [`${val} (${props.payload.percentage}%)`, 'Score']}
                  labelFormatter={(label, items) => items[0]?.payload?.quizTitle || label}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <TrendingUp className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No score history yet</p>
            <p className="text-xs text-slate-400 mt-1">Take a quiz from the Browse Quizzes page to see your score chart</p>
          </div>
        )}
      </div>

      {/* Grid: Recent Attempts & Recently Created Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Attempts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Quiz Attempts</h2>
              <Link to="/my-attempts" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentAttempts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 hover:text-indigo-600">
                        <Link to={`/attempts/${attempt.id}/result`}>{attempt.quizTitle}</Link>
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span>{attempt.categoryName}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{attempt.timeTakenSeconds ? `${Math.round(attempt.timeTakenSeconds / 60)}m` : '0m'}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 justify-end">
                        <span className="text-sm font-bold text-slate-800">
                          {attempt.score}/{attempt.totalMarks}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            attempt.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {attempt.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <Link
                        to={`/attempts/${attempt.id}/review`}
                        className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 mt-1 inline-block"
                      >
                        Review Answers
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={History}
                title="No attempts yet"
                description="Take your first quiz from the browse section to test your skills."
                actionText="Browse Quizzes"
                onAction={() => (window.location.href = '/quizzes')}
                className="my-4 border-none shadow-none"
              />
            )}
          </div>
        </div>

        {/* Recently Created Quizzes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">My Created Quizzes</h2>
              <Link to="/my-quizzes" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
                <span>Manage all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentlyCreatedQuizzes.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentlyCreatedQuizzes.map((quiz) => (
                  <div key={quiz.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 hover:text-indigo-600">
                        <Link to={`/quizzes/${quiz.id}`}>{quiz.title}</Link>
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span>{quiz.categoryName}</span>
                        <span>•</span>
                        <span>{quiz.questionCount || 0} questions</span>
                        <span>•</span>
                        <span>{quiz.totalMarks || 0} marks</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          quiz.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {quiz.status}
                      </span>
                      <Link
                        to={`/quizzes/${quiz.id}/questions`}
                        className="text-xs px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-medium transition"
                      >
                        Questions
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="You haven't created any quizzes yet"
                description="Create a quiz to test other students or practice with your friends."
                actionText="Create Quiz"
                onAction={() => (window.location.href = '/quizzes/create')}
                className="my-4 border-none shadow-none"
              />
            )}
          </div>
        </div>
      </div>

      {/* Available Published Quizzes Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Available Quizzes</h2>
            <p className="text-xs text-slate-500">Pick any quiz to test your knowledge</p>
          </div>
          <Link
            to="/quizzes"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>View all quizzes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {availableQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Compass}
            title="No quizzes available"
            description="Create the first quiz and publish it!"
            actionText="Create Quiz"
            onAction={() => (window.location.href = '/quizzes/create')}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
