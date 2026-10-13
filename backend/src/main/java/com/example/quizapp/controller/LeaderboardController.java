package com.example.quizapp.controller;

import com.example.quizapp.dto.ApiResponse;
import com.example.quizapp.dto.LeaderboardEntryResponse;
import com.example.quizapp.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getGlobalLeaderboard(
            @RequestParam(defaultValue = "20") int limit) {
        List<LeaderboardEntryResponse> leaderboard = leaderboardService.getGlobalLeaderboard(limit);
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getQuizLeaderboard(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "20") int limit) {
        List<LeaderboardEntryResponse> leaderboard = leaderboardService.getQuizLeaderboard(quizId, limit);
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }
}
