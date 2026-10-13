import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { categoryService } from '../services/categoryService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    difficulty: 'MEDIUM',
    durationMinutes: 15,
    passingMarks: 5,
    negativeMarkingEnabled: false,
    negativeMarksPerWrong: 0.25,
  });

  useEffect(() => {
    Promise.all([categoryService.getCategories(), quizService.getQuizById(id)])
      .then(([catRes, quizRes]) => {
        if (catRes.data) setCategories(catRes.data);
        if (quizRes.data) {
          const q = quizRes.data;
          setFormData({
            title: q.title || '',
            description: q.description || '',
            categoryId: q.category?.id || '',
            difficulty: q.difficulty || 'MEDIUM',
            durationMinutes: q.durationMinutes || 15,
            passingMarks: q.passingMarks || 0,
            negativeMarkingEnabled: !!q.negativeMarkingEnabled,
            negativeMarksPerWrong: q.negativeMarksPerWrong || 0.25,
          });
        }
      })
      .catch((err) => {
        error(err.response?.data?.message || 'Failed to load quiz for editing.');
        navigate('/my-quizzes');
      })
      .finally(() => setLoading(false));
  }, [id, navigate, error]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: Number(formData.categoryId),
        difficulty: formData.difficulty,
        durationMinutes: Number(formData.durationMinutes),
        passingMarks: Number(formData.passingMarks),
        negativeMarkingEnabled: formData.negativeMarkingEnabled,
        negativeMarksPerWrong: formData.negativeMarkingEnabled ? Number(formData.negativeMarksPerWrong) : 0,
      };

      await quizService.updateQuiz(id, payload);
      success('Quiz updated successfully!');
      navigate(`/quizzes/${id}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading quiz configuration..." className="py-20" />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Quiz</h1>
          <p className="text-xs text-slate-500 mt-0.5">Modify parameters for "{formData.title}"</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Quiz Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              maxLength={150}
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Difficulty Level <span className="text-rose-500">*</span>
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          {/* Duration & Passing Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Duration (Minutes) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="durationMinutes"
                min={1}
                max={300}
                required
                value={formData.durationMinutes}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Passing Marks <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="passingMarks"
                min={0}
                required
                value={formData.passingMarks}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Negative Marking Toggle */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-slate-800">Negative Marking</span>
                <p className="text-xs text-slate-500">Deduct penalty marks for incorrect answers</p>
              </div>
              <input
                type="checkbox"
                name="negativeMarkingEnabled"
                checked={formData.negativeMarkingEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
              />
            </div>

            {formData.negativeMarkingEnabled && (
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Penalty Per Wrong Answer
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.0"
                  max="10.0"
                  name="negativeMarksPerWrong"
                  value={formData.negativeMarksPerWrong}
                  onChange={handleChange}
                  className="w-full sm:w-48 px-3.5 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuiz;
