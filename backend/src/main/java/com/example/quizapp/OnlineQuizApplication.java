package com.example.quizapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * =========================================================================
 * ONLINE QUIZ MANAGEMENT SYSTEM - STUDENT PROJECT
 * =========================================================================
 * 
 * Main Spring Boot Application Entry Point.
 * 
 * Tech Stack:
 * - Backend: Java 21, Spring Boot 3.2.5 (Web, Data JPA, Security)
 * - Database: MySQL 8.0 with Hibernate ORM
 * - Security: Spring Security 6 + JJWT (JSON Web Token) authentication
 * - AI Integration: Google Gemini API (model: gemini-1.5-flash)
 * - Frontend: React.js 18 + Vite + Tailwind CSS + Lucide Icons + Recharts
 * 
 * Project Features:
 * 1. User Registration, Login & JWT-based authentication
 * 2. Create, Edit, Publish and Delete Quizzes
 * 3. Add questions manually (Option A, B, C, D) OR generate using Gemini AI
 * 4. Timed Quiz Attempt with server-side validation & auto-submit
 * 5. Automatic Scoring (with optional negative marking) and detailed Answer Review
 * 6. Global & Quiz-level Leaderboards
 * 7. Personalized Student Dashboard with performance analytics
 */
@SpringBootApplication
public class OnlineQuizApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlineQuizApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🎓 Online Quiz Management System Backend Running!");
        System.out.println("🌐 Base URL: http://localhost:8080");
        System.out.println("=================================================");
    }
}
