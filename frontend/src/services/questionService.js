import api from './api';

export const questionService = {
  getQuizQuestions: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  addQuestion: async (quizId, questionData) => {
    const response = await api.post(`/quizzes/${quizId}/questions`, questionData);
    return response.data;
  },

  updateQuestion: async (questionId, questionData) => {
    const response = await api.put(`/questions/${questionId}`, questionData);
    return response.data;
  },

  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },
};
