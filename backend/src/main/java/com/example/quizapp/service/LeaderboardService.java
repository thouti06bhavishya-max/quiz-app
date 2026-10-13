package com.example.quizapp.service;

import com.example.quizapp.dto.LeaderboardEntryResponse;
import com.example.quizapp.entity.Quiz;
import com.example.quizapp.entity.QuizAttempt;
import com.example.quizapp.exception.ResourceNotFoundException;
import com.example.quizapp.repository.QuizAttemptRepository;
import com.example.quizapp.repository.QuizRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class LeaderboardService {

    private final QuizAttemptRepository attemptRepository;
    private final QuizRepository quizRepository;

    public LeaderboardService(QuizAttemptRepository attemptRepository, QuizRepository quizRepository) {
        this.attemptRepository = attemptRepository;
        this.quizRepository = quizRepository;
    }

    public List<LeaderboardEntryResponse> getGlobalLeaderboard(int limit) {
        List<Object[]> rows = attemptRepository.findGlobalLeaderboardRaw(PageRequest.of(0, limit));
        List<LeaderboardEntryResponse> leaderboard = new ArrayList<>();

        int rank = 1;
        for (Object[] row : rows) {
            Long userId = ((Number) row[0]).longValue();
            String fullName = (String) row[1];
            BigDecimal totalScore = row[2] != null ? ((BigDecimal) row[2]).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            Double avgPct = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
            Long attemptsCount = row[4] != null ? ((Number) row[4]).longValue() : 0L;
            Long passedCount = row[5] != null ? ((Number) row[5]).longValue() : 0L;

            LeaderboardEntryResponse entry = new LeaderboardEntryResponse();
            entry.setRank(rank++);
            entry.setUserId(userId);
            entry.setUserName(fullName);
            entry.setScore(totalScore);
            entry.setPercentage(BigDecimal.valueOf(avgPct).setScale(2, RoundingMode.HALF_UP));
            entry.setAttemptsCount(attemptsCount);
            entry.setPassedCount(passedCount);

            leaderboard.add(entry);
        }

        return leaderboard;
    }

    public List<LeaderboardEntryResponse> getQuizLeaderboard(Long quizId, int limit) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        List<QuizAttempt> attempts = attemptRepository.findQuizLeaderboard(quiz.getId(), PageRequest.of(0, limit));
        List<LeaderboardEntryResponse> leaderboard = new ArrayList<>();

        int rank = 1;
        for (QuizAttempt att : attempts) {
            LeaderboardEntryResponse entry = new LeaderboardEntryResponse();
            entry.setRank(rank++);
            entry.setUserId(att.getUser().getId());
            entry.setUserName(att.getUser().getFullName());
            entry.setScore(att.getScore());
            entry.setPercentage(att.getPercentage());
            entry.setDate(att.getSubmittedAt());
            leaderboard.add(entry);
        }

        return leaderboard;
    }
}
