package com.example.quizapp.controller;

import com.example.quizapp.dto.*;
import com.example.quizapp.entity.Quiz;
import com.example.quizapp.security.CustomUserDetails;
import com.example.quizapp.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<QuizSummaryResponse>>> getPublishedQuizzes(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Quiz.Difficulty difficulty,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PagedResponse<QuizSummaryResponse> quizzes = quizService.getPublishedQuizzes(
                categoryId, difficulty, search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuizById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long currentUserId = userDetails != null ? userDetails.getId() : null;
        QuizResponse quiz = quizService.getQuizDetails(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(quiz));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody QuizRequest request) {
        QuizResponse quiz = quizService.createQuiz(userDetails.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Quiz created as draft", quiz), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuizResponse>> updateQuiz(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody QuizRequest request) {
        QuizResponse quiz = quizService.updateQuiz(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Quiz updated successfully", quiz));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuiz(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        quizService.deleteQuiz(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Quiz deleted successfully", null));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PagedResponse<QuizSummaryResponse>>> getMyQuizzes(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<QuizSummaryResponse> quizzes = quizService.getMyQuizzes(userDetails.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(quizzes));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<QuizResponse>> publishQuiz(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QuizResponse quiz = quizService.publishQuiz(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Quiz published successfully", quiz));
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<ApiResponse<QuizResponse>> unpublishQuiz(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QuizResponse quiz = quizService.unpublishQuiz(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Quiz unpublished successfully", quiz));
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<ApiResponse<QuizAnalyticsResponse>> getQuizAnalytics(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        QuizAnalyticsResponse analytics = quizService.getQuizAnalytics(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(analytics));
    }
}
