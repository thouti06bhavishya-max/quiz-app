import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../services/leaderboardService';
import { quizService } from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Trophy, Medal, Crown, Globe, BookOpen } from 'lucide-react';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'quiz'
  const [globalData, setGlobalData] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load global leaderboard & available quizzes
    Promise.all([
      leaderboardService.getGlobalLeaderboard(20),
      quizService.getPublishedQuizzes({ size: 50 }),
    ])
      .then(([gRes, qRes]) => {
        if (gRes.data) setGlobalData(gRes.data);
        if (qRes.data && qRes.data.content && qRes.data.content.length > 0) {
          setQuizzes(qRes.data.content);
          setSelectedQuizId(qRes.data.content[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === 'quiz' && selectedQuizId) {
      setLoading(true);
      leaderboardService.getQuizLeaderboard(selectedQuizId, 20)
        .then((res) => {
          if (res.data) setQuizData(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedQuizId]);

  const renderRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs ring-2 ring-amber-400">
          <Crown className="w-4 h-4 fill-amber-500 text-amber-600" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs ring-2 ring-slate-400">
          <Medal className="w-4 h-4 text-slate-600" />
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-900 flex items-center justify-center font-bold text-xs ring-2 ring-amber-600">
          <Medal className="w-4 h-4 text-amber-800" />
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leaderboards</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore top achievers across the entire platform or for specific challenges
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'global'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Global Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'quiz'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Quiz-Specific Standings</span>
        </button>
      </div>

      {/* Quiz Selector when in 'quiz' tab */}
      {activeTab === 'quiz' && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Quiz:
          </label>
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white sm:w-96"
          >
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title} ({q.totalMarks} Marks)
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Computing rankings..." className="py-20" />
      ) : activeTab === 'global' ? (
        /* Global Table */
        globalData.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Participant</th>
                    <th className="px-6 py-4">Total Score</th>
                    <th className="px-6 py-4">Avg Accuracy</th>
                    <th className="px-6 py-4">Quizzes Cleared</th>
                    <th className="px-6 py-4 text-right">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {globalData.map((row) => (
                    <tr key={row.userId} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 whitespace-nowrap">{renderRankBadge(row.rank)}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {row.userName}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-indigo-700 whitespace-nowrap">
                        {row.score} pts
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {row.percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {row.passedCount} Passed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-500 whitespace-nowrap">
                        {row.attemptsCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="Leaderboard is awaiting participants"
            description="Submit quiz attempts to register your scores on the community leaderboard."
          />
        )
      ) : (
        /* Quiz Specific Table */
        quizData.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Participant</th>
                    <th className="px-6 py-4">Highest Score</th>
                    <th className="px-6 py-4">Percentage</th>
                    <th className="px-6 py-4 text-right">Recorded Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {quizData.map((row) => (
                    <tr key={row.userId} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 whitespace-nowrap">{renderRankBadge(row.rank)}</td>
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {row.userName}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-indigo-700 whitespace-nowrap">
                        {row.score} Marks
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {row.percentage}%
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400 whitespace-nowrap">
                        {row.date ? new Date(row.date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Trophy}
            title="No attempts submitted for this quiz yet"
            description="Be the first to attempt this quiz and set the benchmark record!"
            actionText="Start Quiz"
            onAction={() => (window.location.href = `/quizzes/${selectedQuizId}/instructions`)}
          />
        )
      )}
    </div>
  );
};

export default Leaderboard;
