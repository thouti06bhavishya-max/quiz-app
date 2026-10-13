import api from './api';

export const quizService = {
  getPublishedQuizzes: async (params = {}) => {
    const response = await api.get('/quizzes', { params });
    return response.data;
  },

  getQuizById: async (id) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  createQuiz: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  updateQuiz: async (id, quizData) => {
    const response = await api.put(`/quizzes/${id}`, quizData);
    return response.data;
  },

  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },

  getMyQuizzes: async (params = {}) => {
    const response = await api.get('/quizzes/my', { params });
    return response.data;
  },

  publishQuiz: async (id) => {
    const response = await api.post(`/quizzes/${id}/publish`);
    return response.data;
  },

  unpublishQuiz: async (id) => {
    const response = await api.post(`/quizzes/${id}/unpublish`);
    return response.data;
  },

  getQuizAnalytics: async (id) => {
    const response = await api.get(`/quizzes/${id}/analytics`);
    return response.data;
  },
};
