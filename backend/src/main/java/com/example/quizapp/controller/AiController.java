package com.example.quizapp.controller;

import com.example.quizapp.dto.AiExplainMistakeRequest;
import com.example.quizapp.dto.AiGenerateQuestionsRequest;
import com.example.quizapp.dto.ApiResponse;
import com.example.quizapp.dto.QuestionResponse;
import com.example.quizapp.security.CustomUserDetails;
import com.example.quizapp.service.GeminiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for Google Gemini AI features in the Student Quiz System.
 * 
 * Features:
 * 1. Automatically generates quiz questions with 4 options, correct answer, and explanation.
 * 2. Acts as an AI Tutor in Answer Review to explain mistakes to students.
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    // Endpoint 1: Generate multiple-choice questions for a quiz using Gemini API
    @PostMapping("/quizzes/{quizId}/generate-questions")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> generateQuestions(
            @PathVariable Long quizId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AiGenerateQuestionsRequest request) {
        List<QuestionResponse> questions = geminiService.generateQuestionsForQuiz(
                userDetails.getId(), quizId, request
        );
        return ResponseEntity.ok(ApiResponse.success(
                "Gemini AI generated " + questions.size() + " questions successfully!", questions
        ));
    }

    // Endpoint 2: AI Tutor - Explains why a student's answer was incorrect
    @PostMapping("/explain-mistake")
    public ResponseEntity<ApiResponse<Map<String, String>>> explainMistake(
            @Valid @RequestBody AiExplainMistakeRequest request) {
        String explanation = geminiService.explainMistake(request);
        return ResponseEntity.ok(ApiResponse.success(
                "AI explanation generated", Map.of("explanation", explanation)
        ));
    }
}
