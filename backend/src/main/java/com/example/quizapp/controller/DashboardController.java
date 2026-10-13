package com.example.quizapp.controller;

import com.example.quizapp.dto.ApiResponse;
import com.example.quizapp.dto.DashboardStatsResponse;
import com.example.quizapp.security.CustomUserDetails;
import com.example.quizapp.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DashboardStatsResponse stats = dashboardService.getDashboardStats(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
