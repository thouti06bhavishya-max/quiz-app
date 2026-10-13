import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attemptService } from '../services/attemptService';
import { aiService } from '../services/aiService';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  BookOpen,
  Sparkles,
  Bot,
  Loader2,
} from 'lucide-react';

const AnswerReview = () => {
  const { attemptId } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Tutor explanations state: { [questionId]: { loading: boolean, text: string } }
  const [aiExplanations, setAiExplanations] = useState({});

  useEffect(() => {
    attemptService.getAttemptReview(attemptId)
      .then((res) => {
        if (res.data) setReview(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [attemptId]);

  const handleAskAiTutor = async (item) => {
    const qId = item.questionId;
    if (aiExplanations[qId]?.text) return; // already loaded

    setAiExplanations((prev) => ({
      ...prev,
      [qId]: { loading: true, text: null },
    }));

    try {
      const userOptKey = item.selectedOption || 'None';
      const userOptText = userOptKey === 'A' ? item.optionA :
                          userOptKey === 'B' ? item.optionB :
                          userOptKey === 'C' ? item.optionC :
                          userOptKey === 'D' ? item.optionD : 'Unanswered';

      const correctOptKey = item.correctAnswer;
      const correctOptText = correctOptKey === 'A' ? item.optionA :
                             correctOptKey === 'B' ? item.optionB :
                             correctOptKey === 'C' ? item.optionC :
                             correctOptKey === 'D' ? item.optionD : '';

      const res = await aiService.explainMistake({
        questionText: item.questionText,
        userOption: userOptKey,
        userOptionText: userOptText,
        correctOption: correctOptKey,
        correctOptionText: correctOptText,
        explanation: item.explanation || '',
      });

      setAiExplanations((prev) => ({
        ...prev,
        [qId]: { loading: false, text: res.data?.explanation || 'No explanation generated.' },
      }));
    } catch (err) {
      setAiExplanations((prev) => ({
        ...prev,
        [qId]: { loading: false, text: 'Unable to retrieve AI explanation at this time.' },
      }));
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading answer review..." className="py-20" />;
  }

  if (!review) return null;

  const { quizTitle, score, totalMarks, percentage, passed, questions = [] } = review;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to={`/attempts/${attemptId}/result`}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Result Summary</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Answer Review</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quiz: <strong className="text-slate-800">{quizTitle}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
            <span className="text-base font-black text-slate-900">{score} / {totalMarks}</span>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
              passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {passed ? 'PASSED' : 'FAILED'}
          </span>
        </div>
      </div>

      {/* Question Reviews */}
      <div className="space-y-4">
        {questions.map((item, idx) => {
          const isCorrect = item.isCorrect;
          const isUnanswered = !item.selectedOption;
          const aiExp = aiExplanations[item.questionId];

          let badgeColor = 'bg-slate-100 text-slate-700';
          let statusText = 'Not Attempted';
          if (isCorrect) {
            badgeColor = 'bg-emerald-100 text-emerald-800';
            statusText = 'Correct Answer';
          } else if (!isUnanswered) {
            badgeColor = 'bg-rose-100 text-rose-800';
            statusText = 'Incorrect Answer';
          }

          return (
            <div
              key={item.questionId}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                      {item.questionText}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}`}>
                    {statusText}
                  </span>
                  <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    {item.marksAwarded > 0 ? `+${item.marksAwarded}` : item.marksAwarded} Marks
                  </span>
                </div>
              </div>

              {/* 4 Options Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {[
                  { key: 'A', text: item.optionA },
                  { key: 'B', text: item.optionB },
                  { key: 'C', text: item.optionC },
                  { key: 'D', text: item.optionD },
                ].map((opt) => {
                  const isUserSelection = item.selectedOption === opt.key;
                  const isCorrectChoice = item.correctAnswer === opt.key;

                  let optionStyle = 'bg-white border-slate-200 text-slate-700';
                  let icon = null;

                  if (isCorrectChoice) {
                    optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium ring-1 ring-emerald-500';
                    icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
                  } else if (isUserSelection && !isCorrectChoice) {
                    optionStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-medium';
                    icon = <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
                  }

                  return (
                    <div
                      key={opt.key}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${optionStyle}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                            isCorrectChoice
                              ? 'bg-emerald-600 text-white'
                              : isUserSelection
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="truncate">{opt.text}</span>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        {isUserSelection && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                            Your Choice
                          </span>
                        )}
                        {icon}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Standard Explanation */}
              {item.explanation && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Explanation</span>
                  </div>
                  <p className="leading-relaxed pl-5">{item.explanation}</p>
                </div>
              )}

              {/* Ask AI Tutor Section (Especially beneficial for wrong or unanswered questions) */}
              {!isCorrect && (
                <div className="pt-2">
                  {!aiExp ? (
                    <button
                      onClick={() => handleAskAiTutor(item)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-200 text-indigo-700 hover:from-violet-100 hover:to-indigo-100 transition shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                      <span>Ask Gemini AI Tutor: Why was my answer wrong?</span>
                    </button>
                  ) : aiExp.loading ? (
                    <div className="p-3.5 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-800 flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                      <span>Gemini AI Tutor is analyzing your answer...</span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-violet-50 via-indigo-50/50 to-white border border-indigo-200 text-xs text-slate-700 space-y-1.5 shadow-2xs">
                      <div className="flex items-center space-x-1.5 font-bold text-indigo-900">
                        <Bot className="w-4 h-4 text-indigo-600" />
                        <span>Gemini AI Tutor Feedback</span>
                      </div>
                      <p className="leading-relaxed pl-5 text-indigo-950 font-normal">
                        {aiExp.text}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnswerReview;
