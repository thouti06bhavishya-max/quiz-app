package com.example.quizapp.dto;

import com.example.quizapp.entity.Question;
import jakarta.validation.constraints.NotNull;

public class SaveAnswerRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    private Question.CorrectOption selectedOption;

    public SaveAnswerRequest() {
    }

    public SaveAnswerRequest(Long questionId, Question.CorrectOption selectedOption) {
        this.questionId = questionId;
        this.selectedOption = selectedOption;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Question.CorrectOption getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(Question.CorrectOption selectedOption) {
        this.selectedOption = selectedOption;
    }
}
