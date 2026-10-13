import api from './api';

export const leaderboardService = {
  getGlobalLeaderboard: async (limit = 20) => {
    const response = await api.get('/leaderboard', { params: { limit } });
    return response.data;
  },

  getQuizLeaderboard: async (quizId, limit = 20) => {
    const response = await api.get(`/leaderboard/quiz/${quizId}`, { params: { limit } });
    return response.data;
  },
};
