package com.example.quizapp.controller;

import com.example.quizapp.dto.*;
import com.example.quizapp.security.CustomUserDetails;
import com.example.quizapp.service.AttemptService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Managing Student Quiz Attempts and Scoring.
 * 
 * Handles:
 * 1. Starting a quiz attempt (sets timer deadline on server).
 * 2. Saving answers in real time as the student clicks choices.
 * 3. Submitting the quiz and calculating the final score.
 * 4. Viewing past attempt history and detailed answer reviews.
 */
@RestController
@RequestMapping("/api/attempts")
public class AttemptController {

    private final AttemptService attemptService;

    public AttemptController(AttemptService attemptService) {
        this.attemptService = attemptService;
    }

    // 1. Start a new quiz attempt: POST /api/attempts/start
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<AttemptSessionResponse>> startAttempt(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody StartAttemptRequest request) {
        AttemptSessionResponse session = attemptService.startAttempt(userDetails.getId(), request.getQuizId());
        return new ResponseEntity<>(ApiResponse.success("Quiz attempt started", session), HttpStatus.CREATED);
    }

    // 2. Resume active quiz attempt (e.g., after browser refresh): GET /api/attempts/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AttemptSessionResponse>> getAttemptSession(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AttemptSessionResponse session = attemptService.getAttemptSession(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(session));
    }

    // 3. Save student answer for a question in real-time: PUT /api/attempts/{id}/answers
    @PutMapping("/{id}/answers")
    public ResponseEntity<ApiResponse<Void>> saveAnswer(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody SaveAnswerRequest request) {
        attemptService.saveAnswer(userDetails.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Answer saved successfully", null));
    }

    // 4. Submit the quiz and calculate marks: POST /api/attempts/{id}/submit
    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<AttemptResultResponse>> submitAttempt(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AttemptResultResponse result = attemptService.submitAttempt(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Quiz submitted successfully", result));
    }

    // 5. View logged-in student's past quiz attempts: GET /api/attempts/my
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PagedResponse<AttemptSummaryResponse>>> getMyAttempts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<AttemptSummaryResponse> attempts = attemptService.getMyAttempts(
                userDetails.getId(),
                PageRequest.of(page, size, Sort.by("startedAt").descending())
        );
        return ResponseEntity.ok(ApiResponse.success(attempts));
    }

    // 6. View score summary for a completed attempt: GET /api/attempts/{id}/result
    @GetMapping("/{id}/result")
    public ResponseEntity<ApiResponse<AttemptResultResponse>> getAttemptResult(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AttemptResultResponse result = attemptService.getAttemptResult(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // 7. View question-by-question review with correct answers: GET /api/attempts/{id}/review
    @GetMapping("/{id}/review")
    public ResponseEntity<ApiResponse<AttemptReviewResponse>> getAttemptReview(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        AttemptReviewResponse review = attemptService.getAttemptReview(userDetails.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(review));
    }
}
