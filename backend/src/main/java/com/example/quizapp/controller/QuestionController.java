package com.example.quizapp.controller;

import com.example.quizapp.dto.ApiResponse;
import com.example.quizapp.dto.QuestionRequest;
import com.example.quizapp.dto.QuestionResponse;
import com.example.quizapp.security.CustomUserDetails;
import com.example.quizapp.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getQuestionsForCreator(
            @PathVariable Long quizId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<QuestionResponse> questions = questionService.getQuestionsForQuizCreator(userDetails.getId(), quizId);
        return ResponseEntity.ok(ApiResponse.success(questions));
    }

    @PostMapping("/quizzes/{quizId}/questions")
    public ResponseEntity<ApiResponse<QuestionResponse>> addQuestion(
            @PathVariable Long quizId,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody QuestionRequest request) {
        QuestionResponse question = questionService.addQuestion(userDetails.getId(), quizId, request);
        return new ResponseEntity<>(ApiResponse.success("Question added successfully", question), HttpStatus.CREATED);
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody QuestionRequest request) {
        QuestionResponse question = questionService.updateQuestion(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", question));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        questionService.deleteQuestion(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", null));
    }
}
