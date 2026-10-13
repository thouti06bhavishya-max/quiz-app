import api from './api';

export const aiService = {
  generateQuestions: async (quizId, data) => {
    const response = await api.post(`/ai/quizzes/${quizId}/generate-questions`, data);
    return response.data;
  },

  explainMistake: async (data) => {
    const response = await api.post('/ai/explain-mistake', data);
    return response.data;
  },
};
