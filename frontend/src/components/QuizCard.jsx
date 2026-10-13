import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, HelpCircle, Award, Users, Play, Edit3, Trash2, Eye, BarChart2 } from 'lucide-react';

const QuizCard = ({
  quiz,
  isCreator = false,
  onPublishToggle,
  onDelete,
}) => {
  const difficultyColors = {
    EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    HARD: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const isPublished = quiz.status === 'PUBLISHED';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
      <div className="p-5">
        {/* Badges & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {quiz.categoryName || (quiz.category && quiz.category.name) || 'General'}
          </span>
          <div className="flex items-center space-x-1.5">
            {isCreator && (
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
              }`}>
                {quiz.status}
              </span>
            )}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${difficultyColors[quiz.difficulty] || difficultyColors.MEDIUM}`}>
              {quiz.difficulty}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-semibold text-lg text-slate-900 line-clamp-1 hover:text-indigo-600 transition">
          <Link to={`/quizzes/${quiz.id}`}>{quiz.title}</Link>
        </h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {quiz.description || 'No description provided for this quiz.'}
        </p>

        {/* Creator Name */}
        <p className="text-xs text-slate-400 mt-3">
          Created by <span className="font-medium text-slate-600">{quiz.creatorName || (quiz.creator && quiz.creator.fullName) || 'User'}</span>
        </p>

        {/* Quiz Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{quiz.durationMinutes} mins</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
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

      {/* Card Action Footer */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
        {isCreator ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-1">
              <Link
                to={`/quizzes/${quiz.id}/edit`}
                title="Edit Quiz Details"
                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition"
              >
                <Edit3 className="w-4 h-4" />
              </Link>
              <Link
                to={`/quizzes/${quiz.id}/questions`}
                title="Manage Questions"
                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition"
              >
                <HelpCircle className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => onDelete && onDelete(quiz)}
                title="Delete Quiz"
                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onPublishToggle && onPublishToggle(quiz)}
                className={`text-xs px-2.5 py-1.5 font-medium rounded transition ${
                  isPublished
                    ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <Link
                to={`/quizzes/${quiz.id}`}
                className="text-xs px-2.5 py-1.5 font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition"
              >
                View
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Link
              to={`/quizzes/${quiz.id}`}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center space-x-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </Link>
            <Link
              to={`/quizzes/${quiz.id}/instructions`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg shadow-sm transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Quiz</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
