package com.example.quizapp.dto;

import jakarta.validation.constraints.NotBlank;

public class AiExplainMistakeRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    private String userOption;
    private String userOptionText;
    private String correctOption;
    private String correctOptionText;
    private String explanation;

    public AiExplainMistakeRequest() {
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getUserOption() {
        return userOption;
    }

    public void setUserOption(String userOption) {
        this.userOption = userOption;
    }

    public String getUserOptionText() {
        return userOptionText;
    }

    public void setUserOptionText(String userOptionText) {
        this.userOptionText = userOptionText;
    }

    public String getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(String correctOption) {
        this.correctOption = correctOption;
    }

    public String getCorrectOptionText() {
        return correctOptionText;
    }

    public void setCorrectOptionText(String correctOptionText) {
        this.correctOptionText = correctOptionText;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
}
