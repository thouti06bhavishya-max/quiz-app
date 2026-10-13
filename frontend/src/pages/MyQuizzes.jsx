import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  FolderKanban,
  PlusCircle,
  Edit3,
  Trash2,
  ListOrdered,
  Eye,
  BarChart2,
  Clock,
  Award,
  Users,
} from 'lucide-react';

const MyQuizzes = () => {
  const { success, error } = useToast();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Analytics modal
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchMyQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await quizService.getMyQuizzes({ page: currentPage, size: 9 });
      if (res.data) {
        setQuizzes(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load authored quizzes.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, error]);

  useEffect(() => {
    fetchMyQuizzes();
  }, [fetchMyQuizzes]);

  const handlePublishToggle = async (quiz) => {
    try {
      if (quiz.status === 'PUBLISHED') {
        await quizService.unpublishQuiz(quiz.id);
        success(`'${quiz.title}' is now in Draft mode.`);
      } else {
        await quizService.publishQuiz(quiz.id);
        success(`'${quiz.title}' is now Published and live!`);
      }
      fetchMyQuizzes();
    } catch (err) {
      error(err.response?.data?.message || 'Publish operation failed.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    try {
      setDeleting(true);
      await quizService.deleteQuiz(quizToDelete.id);
      success('Quiz deleted successfully.');
      setDeleteModalOpen(false);
      setQuizToDelete(null);
      fetchMyQuizzes();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete quiz.');
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenAnalytics = async (quizId) => {
    try {
      setAnalyticsModalOpen(true);
      setLoadingAnalytics(true);
      const res = await quizService.getQuizAnalytics(quizId);
      if (res.data) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch analytics.');
      setAnalyticsModalOpen(false);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving authored quizzes..." className="py-20" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Quizzes</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your authored quizzes, question banks, and monitor participant metrics
          </p>
        </div>
        <Link
          to="/quizzes/create"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Quiz</span>
        </Link>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const isPublished = quiz.status === 'PUBLISHED';
            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {quiz.categoryName || 'General'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg text-slate-900 line-clamp-1 hover:text-indigo-600">
                    <Link to={`/quizzes/${quiz.id}`}>{quiz.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {quiz.description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{quiz.durationMinutes} mins</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <ListOrdered className="w-4 h-4 text-slate-400" />
                      <span>{quiz.questionCount || 0} questions</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Award className="w-4 h-4 text-slate-400" />
                      <span>{quiz.totalMarks || 0} marks</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{quiz.attemptsCount || 0} attempts</span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Link
                      to={`/quizzes/${quiz.id}/edit`}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition"
                      title="Edit Quiz"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/quizzes/${quiz.id}/questions`}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition"
                      title="Manage Questions"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenAnalytics(quiz.id)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition"
                      title="Analytics"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuizToDelete(quiz);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded transition"
                      title="Delete Quiz"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handlePublishToggle(quiz)}
                    className={`text-xs px-3 py-1.5 font-bold rounded-lg transition ${
                      isPublished
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No quizzes authored yet"
          description="Create your first quiz and add challenging questions for the community to solve."
          actionText="Create Quiz"
          onAction={() => (window.location.href = '/quizzes/create')}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Quiz"
        message={`Are you sure you want to delete '${quizToDelete?.title}'? This action will permanently remove all associated questions and attempts.`}
        confirmText="Delete Quiz"
        isDanger={true}
        isLoading={deleting}
      />

      {/* Analytics Modal */}
      <Modal
        isOpen={analyticsModalOpen}
        onClose={() => setAnalyticsModalOpen(false)}
        title="Quiz Analytics & Statistics"
        confirmText="Close"
        onConfirm={() => setAnalyticsModalOpen(false)}
      >
        {loadingAnalytics ? (
          <LoadingSpinner text="Computing participant metrics..." />
        ) : analyticsData ? (
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">{analyticsData.title}</h4>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                <span className="text-indigo-900 font-extrabold text-lg block">
                  {analyticsData.totalAttempts}
                </span>
                <span className="text-indigo-700 font-medium">Total Attempts</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-emerald-900 font-extrabold text-lg block">
                  {analyticsData.passRate}%
                </span>
                <span className="text-emerald-700 font-medium">Pass Rate</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-amber-900 font-extrabold text-lg block">
                  {analyticsData.averageScore}
                </span>
                <span className="text-amber-700 font-medium">Average Score</span>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                <span className="text-slate-900 font-extrabold text-lg block">
                  {analyticsData.totalMarks}
                </span>
                <span className="text-slate-600 font-medium">Max Marks</span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default MyQuizzes;
