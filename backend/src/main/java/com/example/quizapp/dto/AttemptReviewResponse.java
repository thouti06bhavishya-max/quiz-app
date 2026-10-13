package com.example.quizapp.dto;

import java.math.BigDecimal;
import java.util.List;

public class AttemptReviewResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private BigDecimal score;
    private Integer totalMarks;
    private Integer passingMarks;
    private BigDecimal percentage;
    private Boolean passed;
    private List<QuestionReviewItem> questions;

    public AttemptReviewResponse() {
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

    public List<QuestionReviewItem> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionReviewItem> questions) {
        this.questions = questions;
    }
}
