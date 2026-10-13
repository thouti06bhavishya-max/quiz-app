package com.example.quizapp.dto;

import jakarta.validation.constraints.NotNull;

public class StartAttemptRequest {

    @NotNull(message = "Quiz ID is required")
    private Long quizId;

    public StartAttemptRequest() {
    }

    public StartAttemptRequest(Long quizId) {
        this.quizId = quizId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
}
