package com.example.quizapp.service;

import com.example.quizapp.dto.AttemptSummaryResponse;
import com.example.quizapp.dto.DashboardStatsResponse;
import com.example.quizapp.dto.QuizSummaryResponse;
import com.example.quizapp.entity.Quiz;
import com.example.quizapp.entity.QuizAttempt;
import com.example.quizapp.repository.QuizAttemptRepository;
import com.example.quizapp.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository attemptRepository;
    private final QuizService quizService;
    private final AttemptService attemptService;

    public DashboardService(QuizRepository quizRepository,
                            QuizAttemptRepository attemptRepository,
                            QuizService quizService,
                            AttemptService attemptService) {
        this.quizRepository = quizRepository;
        this.attemptRepository = attemptRepository;
        this.quizService = quizService;
        this.attemptService = attemptService;
    }

    public DashboardStatsResponse getDashboardStats(Long userId) {
        long totalQuizzesCreated = quizRepository.countByCreatorId(userId);
        long totalQuizzesAttempted = attemptRepository.countByUserIdAndStatus(userId, QuizAttempt.AttemptStatus.SUBMITTED);

        BigDecimal avgScore = attemptRepository.findAverageScoreByUserId(userId);
        if (avgScore != null) {
            avgScore = avgScore.setScale(2, RoundingMode.HALF_UP);
        } else {
            avgScore = BigDecimal.ZERO;
        }

        BigDecimal highestScore = attemptRepository.findMaxScoreByUserId(userId);
        if (highestScore != null) {
            highestScore = highestScore.setScale(2, RoundingMode.HALF_UP);
        } else {
            highestScore = BigDecimal.ZERO;
        }

        List<QuizAttempt> recentAttemptsList = attemptRepository.findTop5ByUserIdOrderByStartedAtDesc(userId);
        List<AttemptSummaryResponse> recentAttempts = recentAttemptsList.stream()
                .map(attemptService::mapToSummaryResponse)
                .collect(Collectors.toList());

        List<Quiz> myQuizzesList = quizRepository.findTop5ByCreatorIdOrderByCreatedAtDesc(userId);
        List<QuizSummaryResponse> recentlyCreatedQuizzes = myQuizzesList.stream()
                .map(quizService::mapToSummaryResponse)
                .collect(Collectors.toList());

        List<Quiz> publishedQuizzes = quizRepository.findTop6ByStatusOrderByCreatedAtDesc(Quiz.QuizStatus.PUBLISHED);
        List<QuizSummaryResponse> availableQuizzes = publishedQuizzes.stream()
                .map(quizService::mapToSummaryResponse)
                .collect(Collectors.toList());

        // Performance trend (last 10 submitted attempts in chronological order)
        List<QuizAttempt> trendAttempts = attemptRepository.findByUserIdAndStatusOrderByStartedAtDesc(
                userId, QuizAttempt.AttemptStatus.SUBMITTED);
        
        List<DashboardStatsResponse.PerformanceTrendItem> performanceTrends = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        int limit = Math.min(trendAttempts.size(), 10);
        List<QuizAttempt> sublist = new ArrayList<>(trendAttempts.subList(0, limit));
        Collections.reverse(sublist); // Chronological order

        for (QuizAttempt att : sublist) {
            String dateStr = att.getSubmittedAt() != null ? att.getSubmittedAt().format(formatter) : "";
            performanceTrends.add(new DashboardStatsResponse.PerformanceTrendItem(
                    att.getQuiz().getTitle(),
                    att.getScore(),
                    att.getQuiz().getTotalMarks(),
                    att.getPercentage(),
                    dateStr
            ));
        }

        DashboardStatsResponse stats = new DashboardStatsResponse();
        stats.setTotalQuizzesCreated(totalQuizzesCreated);
        stats.setTotalQuizzesAttempted(totalQuizzesAttempted);
        stats.setAverageScore(avgScore);
        stats.setHighestScore(highestScore);
        stats.setRecentAttempts(recentAttempts);
        stats.setRecentlyCreatedQuizzes(recentlyCreatedQuizzes);
        stats.setAvailableQuizzes(availableQuizzes);
        stats.setPerformanceTrends(performanceTrends);

        return stats;
    }
}
