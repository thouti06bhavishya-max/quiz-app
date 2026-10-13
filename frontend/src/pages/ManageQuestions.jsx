import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { questionService } from '../services/questionService';
import { quizService } from '../services/quizService';
import { aiService } from '../services/aiService';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PlusCircle,
  HelpCircle,
  CheckCircle,
  Edit2,
  Trash2,
  ArrowLeft,
  Award,
  Sparkles,
  Loader2,
  PenTool,
  Zap,
  CheckCircle2,
} from 'lucide-react';

const ManageQuestions = () => {
  const { quizId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Question Form Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // AI Generator Modal
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiSubmitting, setAiSubmitting] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(3);
  const [aiDifficulty, setAiDifficulty] = useState('MEDIUM');
  const [aiMarks, setAiMarks] = useState(2);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form inputs
  const initialFormState = {
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 1,
    explanation: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [qRes, questionsRes] = await Promise.all([
        quizService.getQuizById(quizId),
        questionService.getQuizQuestions(quizId),
      ]);
      if (qRes.data) {
        setQuiz(qRes.data);
        if (!aiTopic) {
          setAiTopic(qRes.data.title || '');
        }
      }
      if (questionsRes.data) setQuestions(questionsRes.data);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load quiz questions.');
    } finally {
      setLoading(false);
    }
  }, [quizId, error, aiTopic]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle URL query actions (e.g. ?action=add-manual or ?action=generate-ai)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add-manual') {
      handleOpenAddModal();
      setSearchParams({}, { replace: true });
    } else if (action === 'generate-ai') {
      setAiModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleOpenAddModal = () => {
    setEditingQuestionId(null);
    setFormData(initialFormState);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (q) => {
    setEditingQuestionId(q.id);
    setFormData({
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      marks: q.marks,
      explanation: q.explanation || '',
    });
    setIsFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'marks' ? Math.max(1, parseInt(value) || 1) : value,
    }));
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (
      !formData.questionText.trim() ||
      !formData.optionA.trim() ||
      !formData.optionB.trim() ||
      !formData.optionC.trim() ||
      !formData.optionD.trim()
    ) {
      error('Question text and all 4 options are required.');
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingQuestionId) {
        await questionService.updateQuestion(editingQuestionId, formData);
        success('Question updated successfully!');
      } else {
        await questionService.addQuestion(quizId, formData);
        success('Question added successfully!');
      }
      setIsFormOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleGenerateWithAi = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      error('Please specify a topic for question generation.');
      return;
    }

    try {
      setAiSubmitting(true);
      const res = await aiService.generateQuestions(quizId, {
        topic: aiTopic.trim(),
        count: Number(aiCount),
        difficulty: aiDifficulty,
        marks: Number(aiMarks),
      });

      success(res.message || 'Questions generated successfully with Gemini AI!');
      setAiModalOpen(false);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'AI generation failed.');
    } finally {
      setAiSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!questionToDelete) return;
    try {
      setDeleting(true);
      await questionService.deleteQuestion(questionToDelete.id);
      success('Question deleted successfully.');
      setDeleteModalOpen(false);
      setQuestionToDelete(null);
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete question.');
    } finally {
      setDeleting(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!quiz) return;
    try {
      if (quiz.status === 'PUBLISHED') {
        await quizService.unpublishQuiz(quiz.id);
        success('Quiz unpublished (saved as draft).');
      } else {
        await quizService.publishQuiz(quiz.id);
        success('Quiz published successfully! It is now live.');
      }
      loadData();
    } catch (err) {
      error(err.response?.data?.message || 'Action failed.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading questions inventory..." className="py-20" />;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to={`/quizzes/${quizId}`}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Questions</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quiz: <strong className="text-slate-700">{quiz?.title}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {quiz && (
            <button
              onClick={handlePublishToggle}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition ${
                quiz.status === 'PUBLISHED'
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
              }`}
            >
              {quiz.status === 'PUBLISHED' ? 'Unpublish Quiz' : 'Publish Quiz'}
            </button>
          )}

          {/* AI Generator Option Button */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>✨ Generate with AI</span>
          </button>

          {/* Manual Option Button */}
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <PenTool className="w-3.5 h-3.5 text-indigo-300" />
            <span>✍️ Add Manually</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-600">Total Questions:</span>
            <strong className="text-slate-900">{questions.length}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-600">Calculated Marks:</span>
            <strong className="text-slate-900">{quiz?.totalMarks || 0}</strong>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-600">Passing Threshold:</span>
            <strong className="text-slate-900">{quiz?.passingMarks || 0}</strong>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-400">Status:</span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              quiz?.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {quiz?.status}
          </span>
        </div>
      </div>

      {/* Empty State with Dual Choice Cards OR Questions List */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-8 animate-fade-in text-center">
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              No questions in this quiz yet
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose how you would like to build questions for this quiz. You can also mix both methods anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto text-left">
            {/* Choice 1: Gemini AI */}
            <div className="p-6 rounded-2xl border-2 border-violet-200 bg-gradient-to-br from-violet-50/70 via-indigo-50/30 to-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl shadow-sm">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                    AI Powered
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">✨ Generate with Gemini AI</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Automatically generate high-quality questions with 4 distinct options, accurate answer keys, and pedagogical explanations.
                </p>
                <ul className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                    <span>Instant generation across any topic</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                    <span>Difficulty & marks customized to quiz</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />
                    <span>Rich explanations for post-exam review</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setAiModalOpen(true)}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate with Gemini AI</span>
                </button>
              </div>
            </div>

            {/* Choice 2: Do Manually */}
            <div className="p-6 rounded-2xl border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-slate-900 text-white rounded-xl shadow-sm">
                    <PenTool className="w-6 h-6 text-indigo-300" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Handcrafted
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">✍️ Do Manually</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Write custom questions by hand. Define question statements, input each option, assign specific marks, and craft custom answers.
                </p>
                <ul className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Complete editorial control over wording</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Exact option configuration (A, B, C, D)</span>
                  </li>
                  <li className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Customizable individual question marks</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleOpenAddModal}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Question Manually</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Add Bar */}
          <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-900">
            <span className="font-semibold flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Want to expand this quiz?</span>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAiModalOpen(true)}
                className="px-2.5 py-1 bg-white hover:bg-violet-50 text-violet-700 font-bold rounded-lg border border-violet-200 transition text-[11px] inline-flex items-center space-x-1 shadow-xs"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>+ AI Generate More</span>
              </button>
              <button
                onClick={handleOpenAddModal}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-lg border border-slate-200 transition text-[11px] inline-flex items-center space-x-1 shadow-xs"
              >
                <PlusCircle className="w-3 h-3 text-indigo-600" />
                <span>+ Add Manually</span>
              </button>
            </div>
          </div>

          {/* Question List */}
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 leading-snug">{q.questionText}</h3>
                    <span className="text-xs text-slate-400 mt-1 inline-block">
                      Award: <strong className="text-slate-600">{q.marks} mark{q.marks > 1 ? 's' : ''}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded transition"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setQuestionToDelete(q);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded transition"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Options 2x2 grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                {[
                  { key: 'A', text: q.optionA },
                  { key: 'B', text: q.optionB },
                  { key: 'C', text: q.optionC },
                  { key: 'D', text: q.optionD },
                ].map((opt) => {
                  const isCorrect = q.correctAnswer === opt.key;
                  return (
                    <div
                      key={opt.key}
                      className={`p-2.5 rounded-lg border flex items-start space-x-2 ${
                        isCorrect
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="break-words flex-1">{opt.text}</span>
                      {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation if present */}
              {q.explanation && (
                <div className="pt-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <strong className="text-slate-700">Explanation: </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Gemini AI Question Generator Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 my-8 overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Gemini AI Generator</h3>
              </div>
              <button
                onClick={() => !aiSubmitting && setAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateWithAi} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Topic or Concept <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java Streams, React useEffect, SQL Joins..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Question Count
                  </label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} Question{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Difficulty
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Marks per Question
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={aiMarks}
                  onChange={(e) => setAiMarks(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                <span className="font-bold">✨ Intelligent Generation: </span>
                Gemini constructs technically sound question statements, 4 choices, 1 correct option, and comprehensive explanations automatically.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  disabled={aiSubmitting}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiSubmitting}
                  className="inline-flex items-center space-x-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow transition disabled:opacity-50"
                >
                  {aiSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Questions</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add / Edit Question Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-100 my-8 overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                <PenTool className="w-4 h-4 text-indigo-600" />
                <span>{editingQuestionId ? 'Edit Question' : 'Add Question Manually'}</span>
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Question Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="questionText"
                  required
                  rows={2}
                  placeholder="Enter the question statement..."
                  value={formData.questionText}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['A', 'B', 'C', 'D'].map((opt) => (
                  <div key={opt}>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Option {opt} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name={`option${opt}`}
                      required
                      placeholder={`Choice ${opt}`}
                      value={formData[`option${opt}`]}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>

              {/* Correct Answer & Marks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Correct Answer <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4 mt-2">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <label key={opt} className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={opt}
                          checked={formData.correctAnswer === opt}
                          onChange={handleFormChange}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="text-slate-700">Option {opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Question Marks <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="marks"
                    min={1}
                    max={100}
                    required
                    value={formData.marks}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Explanation (Shown after quiz submission)
                </label>
                <textarea
                  name="explanation"
                  rows={2}
                  placeholder="Provide clarity on why the correct answer is valid..."
                  value={formData.explanation}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 inline-flex items-center space-x-2"
                >
                  {formSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{editingQuestionId ? 'Update Question' : 'Save Question'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Question Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Question"
        message="Are you sure you want to delete this question? This will automatically recalculate total quiz marks."
        confirmText="Delete"
        isDanger={true}
        isLoading={deleting}
      />
    </div>
  );
};

export default ManageQuestions;
