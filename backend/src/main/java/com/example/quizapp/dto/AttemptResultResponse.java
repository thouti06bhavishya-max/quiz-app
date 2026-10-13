package com.example.quizapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AttemptResultResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Integer totalMarks;
    private Integer passingMarks;
    private BigDecimal score;
    private BigDecimal percentage;
    private Boolean passed;
    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer wrongAnswers;
    private Integer unansweredQuestions;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Long timeTakenSeconds;
    private Boolean negativeMarkingEnabled;
    private BigDecimal negativeMarksPerWrong;

    public AttemptResultResponse() {
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

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public Integer getWrongAnswers() {
        return wrongAnswers;
    }

    public void setWrongAnswers(Integer wrongAnswers) {
        this.wrongAnswers = wrongAnswers;
    }

    public Integer getUnansweredQuestions() {
        return unansweredQuestions;
    }

    public void setUnansweredQuestions(Integer unansweredQuestions) {
        this.unansweredQuestions = unansweredQuestions;
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
}
