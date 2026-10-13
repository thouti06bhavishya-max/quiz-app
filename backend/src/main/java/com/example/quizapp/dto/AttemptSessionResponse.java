package com.example.quizapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AttemptSessionResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Integer durationMinutes;
    private Integer totalMarks;
    private Integer passingMarks;
    private Boolean negativeMarkingEnabled;
    private BigDecimal negativeMarksPerWrong;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private Long remainingSeconds;
    private List<QuestionTakerResponse> questions;
    private Map<Long, String> savedAnswers;

    public AttemptSessionResponse() {
    }

    // Getters and Setters
    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
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

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
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

    public Boolean getNegativeMarkingEnabled() {
        return negativeMarkingEnabled;
    }

    public void setNegativeMarkingEnabled(Boolean negativeMarkingEnabled) {
        this.negativeMarkingEnabled = negativeMarkingEnabled;
    }

    public BigDecimal getNegativeMarksPerWrong() {
        return negativeMarksPerWrong;
    }

    public void setNegativeMarksPerWrong(BigDecimal negativeMarksPerWrong) {
        this.negativeMarksPerWrong = negativeMarksPerWrong;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Long getRemainingSeconds() {
        return remainingSeconds;
    }

    public void setRemainingSeconds(Long remainingSeconds) {
        this.remainingSeconds = remainingSeconds;
    }

    public List<QuestionTakerResponse> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionTakerResponse> questions) {
        this.questions = questions;
    }

    public Map<Long, String> getSavedAnswers() {
        return savedAnswers;
    }

    public void setSavedAnswers(Map<Long, String> savedAnswers) {
        this.savedAnswers = savedAnswers;
    }
}
