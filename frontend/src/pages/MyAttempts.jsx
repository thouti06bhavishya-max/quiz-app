import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { attemptService } from '../services/attemptService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  History,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
} from 'lucide-react';

const MyAttempts = () => {
  const { error } = useToast();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchAttempts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await attemptService.getMyAttempts({ page: currentPage, size: 10 });
      if (res.data) {
        setAttempts(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load attempt history.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, error]);

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  if (loading) {
    return <LoadingSpinner text="Retrieving assessment history..." className="py-20" />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Attempts</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your quiz attempt records, examination scores, and detailed answer breakdowns
        </p>
      </div>

      {attempts.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Quiz Title</th>
                  <th className="px-6 py-4">Attempt Date</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Time Taken</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {attempts.map((attempt) => {
                  const mins = Math.floor((attempt.timeTakenSeconds || 0) / 60);
                  const secs = (attempt.timeTakenSeconds || 0) % 60;
                  const dateStr = attempt.submittedAt || attempt.startedAt;

                  return (
                    <tr key={attempt.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <Link
                          to={`/attempts/${attempt.id}/result`}
                          className="font-bold text-slate-900 hover:text-indigo-600 block line-clamp-1"
                        >
                          {attempt.quizTitle}
                        </Link>
                        <span className="text-xs text-slate-400 mt-0.5 inline-block">
                          {attempt.categoryName} • {attempt.difficulty}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {dateStr ? new Date(dateStr).toLocaleDateString() : '-'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-extrabold text-slate-900">
                          {attempt.score} / {attempt.totalMarks}
                        </span>
                        <span className="text-xs text-slate-400 ml-1.5 font-medium">
                          ({attempt.percentage}%)
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            attempt.passed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {attempt.passed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Pass</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Fail</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/attempts/${attempt.id}/result`}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            Result
                          </Link>
                          <Link
                            to={`/attempts/${attempt.id}/review`}
                            className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                          >
                            Review
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No attempts on record"
          description="You haven't participated in any quizzes yet. Explore available quizzes to test your proficiency."
          actionText="Explore Quizzes"
          onAction={() => (window.location.href = '/quizzes')}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                currentPage === idx
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyAttempts;
