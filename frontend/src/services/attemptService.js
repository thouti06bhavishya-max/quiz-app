import api from './api';

export const attemptService = {
  startAttempt: async (quizId) => {
    const response = await api.post('/attempts/start', { quizId });
    return response.data;
  },

  getAttemptSession: async (attemptId) => {
    const response = await api.get(`/attempts/${attemptId}`);
    return response.data;
  },

  saveAnswer: async (attemptId, questionId, selectedOption) => {
    const response = await api.put(`/attempts/${attemptId}/answers`, {
      questionId,
      selectedOption,
    });
    return response.data;
  },

  submitAttempt: async (attemptId) => {
    const response = await api.post(`/attempts/${attemptId}/submit`);
    return response.data;
  },

  getMyAttempts: async (params = {}) => {
    const response = await api.get('/attempts/my', { params });
    return response.data;
  },

  getAttemptResult: async (attemptId) => {
    const response = await api.get(`/attempts/${attemptId}/result`);
    return response.data;
  },

  getAttemptReview: async (attemptId) => {
    const response = await api.get(`/attempts/${attemptId}/review`);
    return response.data;
  },
};
