import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import { categoryService } from '../services/categoryService';
import { aiService } from '../services/aiService';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  PenTool,
  CheckCircle2,
  Bot,
  Sliders,
  HelpCircle,
  Zap,
} from 'lucide-react';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState(''); // 'creating' | 'generating'

  // Creation Mode: 'MANUAL' or 'AI'
  const [creationMode, setCreationMode] = useState('MANUAL');

  // Form Data
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

  // AI-specific generation parameters
  const [aiSettings, setAiSettings] = useState({
    topic: '',
    count: 5,
    marks: 2,
  });

  useEffect(() => {
    categoryService
      .getCategories()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
          setFormData((prev) => ({ ...prev, categoryId: res.data[0].id }));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // Auto-update AI topic if user hasn't typed custom topic yet
      if (name === 'title' && (!aiSettings.topic || aiSettings.topic === prev.title)) {
        setAiSettings((a) => ({ ...a, topic: value }));
      }
      return updated;
    });
  };

  const handleAiSettingChange = (e) => {
    const { name, value } = e.target;
    setAiSettings((prev) => ({
      ...prev,
      [name]: name === 'count' || name === 'marks' ? Math.max(1, parseInt(value) || 1) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      error('Quiz title is required.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitStage('creating');

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

      const res = await quizService.createQuiz(payload);
      const newQuizId = res.data?.id;

      if (!newQuizId) {
        throw new Error('Quiz creation returned invalid ID');
      }

      // If AI mode was selected, generate questions immediately
      if (creationMode === 'AI') {
        setSubmitStage('generating');
        const topicToUse = aiSettings.topic.trim() || formData.title.trim();
        try {
          await aiService.generateQuestions(newQuizId, {
            topic: topicToUse,
            count: Number(aiSettings.count),
            difficulty: formData.difficulty,
            marks: Number(aiSettings.marks),
          });
          success(`Quiz created and ${aiSettings.count} questions generated with Gemini AI!`);
          navigate(`/quizzes/${newQuizId}/questions`);
        } catch (aiErr) {
          // If AI generation has an issue, quiz is still created
          error(aiErr.response?.data?.message || 'Quiz created, but AI question generation encountered an error.');
          navigate(`/quizzes/${newQuizId}/questions?action=generate-ai`);
        }
      } else {
        // Manual mode
        success('Quiz created as draft! Author your questions manually.');
        navigate(`/quizzes/${newQuizId}/questions?action=add-manual`);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create quiz.');
    } finally {
      setSubmitting(false);
      setSubmitStage('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create New Quiz</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose between manual authoring or automatic question generation powered by Gemini AI
          </p>
        </div>
      </div>

      {/* Mode Selector Cards */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Step 1: Choose Question Creation Method
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Manual Option */}
          <button
            type="button"
            onClick={() => setCreationMode('MANUAL')}
            className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              creationMode === 'MANUAL'
                ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-start justify-between w-full mb-2">
              <div
                className={`p-2.5 rounded-xl ${
                  creationMode === 'MANUAL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <PenTool className="w-5 h-5" />
              </div>
              {creationMode === 'MANUAL' && (
                <span className="flex items-center text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Selected
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">✍️ Do Manually</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Author your own questions, write 4 multiple-choice options, mark correct answers, and provide custom explanations.
              </p>
            </div>
          </button>

          {/* AI Generator Option */}
          <button
            type="button"
            onClick={() => setCreationMode('AI')}
            className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
              creationMode === 'AI'
                ? 'border-violet-600 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 text-violet-950 shadow-md ring-2 ring-violet-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-start justify-between w-full mb-2">
              <div
                className={`p-2.5 rounded-xl ${
                  creationMode === 'AI'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold bg-violet-200 text-violet-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini AI
                </span>
                {creationMode === 'AI' && (
                  <span className="flex items-center text-xs font-semibold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Selected
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                <span>✨ Generate with AI</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Let Google Gemini AI instantly craft challenging questions, plausible distractors, and educational explanations.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Step 2: Quiz Details & Configuration
            </h2>
          </div>

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
              placeholder="e.g., Core Java OOP Concepts Challenge"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
              placeholder="Explain what topics are covered and who this quiz is designed for..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                disabled={loadingCategories}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Time allowed per attempt</span>
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
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Minimum score required to pass</span>
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
                id="negToggle"
                checked={formData.negativeMarkingEnabled}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 cursor-pointer"
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

          {/* Conditional AI Generation Settings Card */}
          {creationMode === 'AI' && (
            <div className="p-5 bg-gradient-to-br from-violet-50/70 via-indigo-50/40 to-white rounded-2xl border-2 border-violet-200 shadow-xs space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-violet-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-violet-600 text-white rounded-lg">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Gemini AI Generation Parameters</h3>
                    <p className="text-xs text-violet-700">Questions will be generated automatically upon quiz creation</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                  Google Gemini API
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Topic / Conceptual Focus <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  placeholder="e.g. Polymorphism, Inheritance, Exception Handling, Memory Management"
                  value={aiSettings.topic}
                  onChange={handleAiSettingChange}
                  className="w-full px-3.5 py-2 text-sm border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Leave as title or specify distinct sub-topics for more targeted questions.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Number of Questions to Generate
                  </label>
                  <select
                    name="count"
                    value={aiSettings.count}
                    onChange={handleAiSettingChange}
                    className="w-full px-3.5 py-2 text-sm border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  >
                    {[1, 2, 3, 5, 8, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} Question{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Marks per Question
                  </label>
                  <input
                    type="number"
                    name="marks"
                    min={1}
                    max={20}
                    value={aiSettings.marks}
                    onChange={handleAiSettingChange}
                    className="w-full px-3.5 py-2 text-sm border border-violet-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-violet-100 flex items-start space-x-2.5 text-xs text-slate-600">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  Gemini will formulate 4 clear choices (A, B, C, D) with exactly one correct answer and an instructive explanation for each question.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50 ${
                creationMode === 'AI'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-violet-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {submitStage === 'generating'
                      ? 'Generating Questions with Gemini AI...'
                      : 'Creating Quiz...'}
                  </span>
                </>
              ) : creationMode === 'AI' ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Create Quiz & Generate with Gemini AI</span>
                </>
              ) : (
                <>
                  <PenTool className="w-4 h-4" />
                  <span>Create Quiz & Add Questions Manually</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;
