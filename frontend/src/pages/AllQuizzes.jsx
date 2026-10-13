import React, { useState, useEffect, useCallback } from 'react';
import { quizService } from '../services/quizService';
import { categoryService } from '../services/categoryService';
import QuizCard from '../components/QuizCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { Search, Filter, ArrowUpDown, Compass } from 'lucide-react';

const AllQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter and search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    categoryService.getCategories()
      .then((res) => {
        if (res.data) setCategories(res.data);
      })
      .catch(() => {});
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        size: 9,
        sortBy,
        sortDir,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const res = await quizService.getPublishedQuizzes(params);
      if (res.data) {
        setQuizzes(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch {
      // error handled
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedCategory, selectedDifficulty, sortBy, sortDir]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchQuizzes();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchQuizzes]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSortBy('createdAt');
    setSortDir('desc');
    setCurrentPage(0);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Explore Quizzes</h1>
        <p className="text-sm text-slate-500 mt-1">
          Browse published quizzes across diverse topics and test your skills
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search quizzes by title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Sort Controls & Count */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 gap-3">
          <p className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{quizzes.length}</strong> of <strong className="text-slate-800">{totalElements}</strong> quizzes
          </p>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort by:</span>
            </div>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split('-');
                setSortBy(field);
                setSortDir(dir);
                setCurrentPage(0);
              }}
              className="text-xs border border-slate-200 rounded-md py-1 px-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
            </select>

            {(search || selectedCategory || selectedDifficulty) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium underline transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <LoadingSpinner text="Loading quizzes..." className="py-20" />
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Compass}
          title="No quizzes match your filters"
          description="Try broadening your search query or removing the category or difficulty filters."
          actionText="Clear Filters"
          onAction={handleResetFilters}
        />
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
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

export default AllQuizzes;
