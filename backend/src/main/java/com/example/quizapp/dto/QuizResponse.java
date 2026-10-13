package com.example.quizapp.dto;

import com.example.quizapp.entity.Quiz;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private CategoryResponse category;
    private Quiz.Difficulty difficulty;
    private UserResponse creator;
    private Integer durationMinutes;
    private Integer totalMarks;
    private Integer passingMarks;
    private Boolean negativeMarkingEnabled;
    private BigDecimal negativeMarksPerWrong;
    private Integer questionCount;
    private Quiz.QuizStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long attemptsCount;

    public QuizResponse() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CategoryResponse getCategory() {
        return category;
    }

    public void setCategory(CategoryResponse category) {
        this.category = category;
    }

    public Quiz.Difficulty getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Quiz.Difficulty difficulty) {
        this.difficulty = difficulty;
    }

    public UserResponse getCreator() {
        return creator;
    }

    public void setCreator(UserResponse creator) {
        this.creator = creator;
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

    public Integer getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(Integer questionCount) {
        this.questionCount = questionCount;
    }

    public Quiz.QuizStatus getStatus() {
        return status;
    }

    public void setStatus(Quiz.QuizStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getAttemptsCount() {
        return attemptsCount;
    }

    public void setAttemptsCount(Long attemptsCount) {
        this.attemptsCount = attemptsCount;
    }
}
