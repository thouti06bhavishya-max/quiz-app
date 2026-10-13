package com.example.quizapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LeaderboardEntryResponse {
    private int rank;
    private Long userId;
    private String userName;
    private BigDecimal score;
    private BigDecimal percentage;
    private Long passedCount;
    private Long attemptsCount;
    private LocalDateTime date;

    public LeaderboardEntryResponse() {
    }

    public LeaderboardEntryResponse(int rank, Long userId, String userName, BigDecimal score, BigDecimal percentage, Long passedCount, Long attemptsCount, LocalDateTime date) {
        this.rank = rank;
        this.userId = userId;
        this.userName = userName;
        this.score = score;
        this.percentage = percentage;
        this.passedCount = passedCount;
        this.attemptsCount = attemptsCount;
        this.date = date;
    }

    // Getters and Setters
    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public BigDecimal getScore() {
        return score;
    }

    public void setScore(BigDecimal score) {
        this.score = score;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }

    public Long getPassedCount() {
        return passedCount;
    }

    public void setPassedCount(Long passedCount) {
        this.passedCount = passedCount;
    }

    public Long getAttemptsCount() {
        return attemptsCount;
    }

    public void setAttemptsCount(Long attemptsCount) {
        this.attemptsCount = attemptsCount;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
