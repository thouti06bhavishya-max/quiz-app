package com.example.quizapp.dto;

import com.example.quizapp.entity.Quiz;
import com.example.quizapp.entity.QuizAttempt;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AttemptSummaryResponse {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private String categoryName;
    private Quiz.Difficulty difficulty;
    private BigDecimal score;
    private Integer totalMarks;
    private Integer passingMarks;
    private BigDecimal percentage;
    private Boolean passed;
    private QuizAttempt.AttemptStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Long timeTakenSeconds;

    public AttemptSummaryResponse() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Quiz.Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Quiz.Difficulty difficulty) {
        this.difficulty = difficulty;
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

    public Integer getPassingMarks() {
        return passingMarks;
    }

    public void setPassingMarks(Integer passingMarks) {
        this.passingMarks = passingMarks;
    }

    public BigDecimal getPercentage() {
        return percentage;
    }

    public void setPercentage(BigDecimal percentage) {
        this.percentage = percentage;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public QuizAttempt.AttemptStatus getStatus() {
        return status;
    }

    public void setStatus(QuizAttempt.AttemptStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Long getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(Long timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }
}
