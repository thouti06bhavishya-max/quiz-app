package com.example.quizapp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class AiGenerateQuestionsRequest {

    @NotBlank(message = "Topic is required")
    private String topic;

    @Min(value = 1, message = "Count must be at least 1")
    @Max(value = 10, message = "Count cannot exceed 10 per request")
    private int count = 5;

    private String difficulty = "MEDIUM";

    @Min(value = 1, message = "Marks must be at least 1")
    private int marks = 2;

    public AiGenerateQuestionsRequest() {
    }

    public AiGenerateQuestionsRequest(String topic, int count, String difficulty, int marks) {
        this.topic = topic;
        this.count = count;
        this.difficulty = difficulty;
        this.marks = marks;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public int getMarks() {
        return marks;
    }

    public void setMarks(int marks) {
        this.marks = marks;
    }
}
