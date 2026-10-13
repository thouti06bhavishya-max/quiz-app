package com.example.quizapp.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardStatsResponse {
    private long totalQuizzesCreated;
    private long totalQuizzesAttempted;
    private BigDecimal averageScore;
    private BigDecimal highestScore;
    private List<AttemptSummaryResponse> recentAttempts;
    private List<QuizSummaryResponse> recentlyCreatedQuizzes;
    private List<QuizSummaryResponse> availableQuizzes;
    private List<PerformanceTrendItem> performanceTrends;

    public static class PerformanceTrendItem {
        private String quizTitle;
        private BigDecimal score;
        private Integer totalMarks;
        private BigDecimal percentage;
        private String date;

        public PerformanceTrendItem() {
        }

        public PerformanceTrendItem(String quizTitle, BigDecimal score, Integer totalMarks, BigDecimal percentage, String date) {
            this.quizTitle = quizTitle;
            this.score = score;
            this.totalMarks = totalMarks;
            this.percentage = percentage;
            this.date = date;
        }

        public String getQuizTitle() {
            return quizTitle;
        }

        public void setQuizTitle(String quizTitle) {
            this.quizTitle = quizTitle;
        }

        public BigDecimal getScore() {
            return score;
        }

        public void setScore(BigDecimal score) {
            this.score = score;
        }

        public Integer getTotalMarks() {
            return totalMarks;
        }

        public void setTotalMarks(Integer totalMarks) {
            this.totalMarks = totalMarks;
        }

        public BigDecimal getPercentage() {
            return percentage;
        }

        public void setPercentage(BigDecimal percentage) {
            this.percentage = percentage;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }
    }

    public DashboardStatsResponse() {
    }

    // Getters and Setters
    public long getTotalQuizzesCreated() {
        return totalQuizzesCreated;
    }

    public void setTotalQuizzesCreated(long totalQuizzesCreated) {
        this.totalQuizzesCreated = totalQuizzesCreated;
    }

    public long getTotalQuizzesAttempted() {
        return totalQuizzesAttempted;
    }

    public void setTotalQuizzesAttempted(long totalQuizzesAttempted) {
        this.totalQuizzesAttempted = totalQuizzesAttempted;
    }

    public BigDecimal getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(BigDecimal averageScore) {
        this.averageScore = averageScore;
    }

    public BigDecimal getHighestScore() {
        return highestScore;
    }

    public void setHighestScore(BigDecimal highestScore) {
        this.highestScore = highestScore;
    }

    public List<AttemptSummaryResponse> getRecentAttempts() {
        return recentAttempts;
    }

    public void setRecentAttempts(List<AttemptSummaryResponse> recentAttempts) {
        this.recentAttempts = recentAttempts;
    }

    public List<QuizSummaryResponse> getRecentlyCreatedQuizzes() {
        return recentlyCreatedQuizzes;
    }

    public void setRecentlyCreatedQuizzes(List<QuizSummaryResponse> recentlyCreatedQuizzes) {
        this.recentlyCreatedQuizzes = recentlyCreatedQuizzes;
    }

    public List<QuizSummaryResponse> getAvailableQuizzes() {
        return availableQuizzes;
    }

    public void setAvailableQuizzes(List<QuizSummaryResponse> availableQuizzes) {
        this.availableQuizzes = availableQuizzes;
    }

    public List<PerformanceTrendItem> getPerformanceTrends() {
        return performanceTrends;
    }

    public void setPerformanceTrends(List<PerformanceTrendItem> performanceTrends) {
        this.performanceTrends = performanceTrends;
    }
}
