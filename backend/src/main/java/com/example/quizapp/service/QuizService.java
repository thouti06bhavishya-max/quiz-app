package com.example.quizapp.service;

import com.example.quizapp.dto.*;
import com.example.quizapp.entity.Category;
import com.example.quizapp.entity.Quiz;
import com.example.quizapp.entity.User;
import com.example.quizapp.exception.BadRequestException;
import com.example.quizapp.exception.ForbiddenException;
import com.example.quizapp.exception.ResourceNotFoundException;
import com.example.quizapp.repository.CategoryRepository;
import com.example.quizapp.repository.QuestionRepository;
import com.example.quizapp.repository.QuizAttemptRepository;
import com.example.quizapp.repository.QuizRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository attemptRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public QuizService(QuizRepository quizRepository,
                       CategoryRepository categoryRepository,
                       QuestionRepository questionRepository,
                       QuizAttemptRepository attemptRepository,
                       UserService userService,
                       NotificationService notificationService) {
        this.quizRepository = quizRepository;
        this.categoryRepository = categoryRepository;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    public Quiz getQuizEntity(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
    }

    @Transactional
    public QuizResponse createQuiz(Long userId, QuizRequest request) {
        User creator = userService.getUserEntity(userId);
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Quiz quiz = new Quiz();
        quiz.setTitle(request.getTitle().trim());
        quiz.setDescription(request.getDescription());
        quiz.setCategory(category);
        quiz.setDifficulty(request.getDifficulty());
        quiz.setCreator(creator);
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setPassingMarks(request.getPassingMarks());
        quiz.setNegativeMarkingEnabled(Boolean.TRUE.equals(request.getNegativeMarkingEnabled()));
        quiz.setNegativeMarksPerWrong(request.getNegativeMarksPerWrong() != null ? request.getNegativeMarksPerWrong() : BigDecimal.ZERO);
        quiz.setStatus(Quiz.QuizStatus.DRAFT);
        quiz.setTotalMarks(0);
        quiz.setQuestionCount(0);

        Quiz saved = quizRepository.save(quiz);
        return mapToResponse(saved);
    }

    @Transactional
    public QuizResponse updateQuiz(Long userId, Long quizId, QuizRequest request) {
        Quiz quiz = getQuizEntity(quizId);
        verifyOwnership(userId, quiz);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        quiz.setTitle(request.getTitle().trim());
        quiz.setDescription(request.getDescription());
        quiz.setCategory(category);
        quiz.setDifficulty(request.getDifficulty());
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setPassingMarks(request.getPassingMarks());
        quiz.setNegativeMarkingEnabled(Boolean.TRUE.equals(request.getNegativeMarkingEnabled()));
        quiz.setNegativeMarksPerWrong(request.getNegativeMarksPerWrong() != null ? request.getNegativeMarksPerWrong() : BigDecimal.ZERO);

        Quiz saved = quizRepository.save(quiz);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteQuiz(Long userId, Long quizId) {
        Quiz quiz = getQuizEntity(quizId);
        verifyOwnership(userId, quiz);
        quizRepository.delete(quiz);
    }

    @Transactional
    public QuizResponse publishQuiz(Long userId, Long quizId) {
        Quiz quiz = getQuizEntity(quizId);
        verifyOwnership(userId, quiz);

        if (quiz.getQuestionCount() == null || quiz.getQuestionCount() <= 0) {
            throw new BadRequestException("Cannot publish a quiz with 0 questions. Please add questions first.");
        }

        if (quiz.getTotalMarks() == null || quiz.getTotalMarks() <= 0) {
            throw new BadRequestException("Quiz total marks must be greater than zero.");
        }

        if (quiz.getPassingMarks() > quiz.getTotalMarks()) {
            throw new BadRequestException("Passing marks cannot exceed total marks (" + quiz.getTotalMarks() + ").");
        }

        quiz.setStatus(Quiz.QuizStatus.PUBLISHED);
        Quiz saved = quizRepository.save(quiz);

        notificationService.createNotification(
                quiz.getCreator(),
                "Quiz Published",
                "Your quiz '" + quiz.getTitle() + "' is now published and available to take.",
                "QUIZ_PUBLISHED"
        );

        return mapToResponse(saved);
    }

    @Transactional
    public QuizResponse unpublishQuiz(Long userId, Long quizId) {
        Quiz quiz = getQuizEntity(quizId);
        verifyOwnership(userId, quiz);

        quiz.setStatus(Quiz.QuizStatus.DRAFT);
        Quiz saved = quizRepository.save(quiz);
        return mapToResponse(saved);
    }

    public QuizResponse getQuizDetails(Long quizId, Long currentUserId) {
        Quiz quiz = getQuizEntity(quizId);

        // If draft, only creator can view details
        if (quiz.getStatus() == Quiz.QuizStatus.DRAFT) {
            if (currentUserId == null || !quiz.getCreator().getId().equals(currentUserId)) {
                throw new ForbiddenException("This quiz is in draft mode and can only be viewed by its creator.");
            }
        }

        return mapToResponse(quiz);
    }

    public PagedResponse<QuizSummaryResponse> getPublishedQuizzes(
            Long categoryId,
            Quiz.Difficulty difficulty,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir.toUpperCase()), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Quiz> quizPage = quizRepository.findPublishedQuizzes(
                categoryId,
                difficulty,
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                pageable
        );

        List<QuizSummaryResponse> summaries = quizPage.getContent().stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                summaries,
                quizPage.getNumber(),
                quizPage.getSize(),
                quizPage.getTotalElements(),
                quizPage.getTotalPages(),
                quizPage.isLast()
        );
    }

    public PagedResponse<QuizSummaryResponse> getMyQuizzes(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Quiz> quizPage = quizRepository.findByCreatorId(userId, pageable);

        List<QuizSummaryResponse> summaries = quizPage.getContent().stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                summaries,
                quizPage.getNumber(),
                quizPage.getSize(),
                quizPage.getTotalElements(),
                quizPage.getTotalPages(),
                quizPage.isLast()
        );
    }

    public QuizAnalyticsResponse getQuizAnalytics(Long userId, Long quizId) {
        Quiz quiz = getQuizEntity(quizId);
        verifyOwnership(userId, quiz);

        long totalAttempts = attemptRepository.countByQuizId(quizId);
        long passedAttempts = attemptRepository.countPassedByQuizId(quizId);
        long failedAttempts = totalAttempts - passedAttempts;

        BigDecimal passRate = BigDecimal.ZERO;
        if (totalAttempts > 0) {
            passRate = BigDecimal.valueOf(passedAttempts)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalAttempts), 2, RoundingMode.HALF_UP);
        }

        BigDecimal averageScore = attemptRepository.findAverageScoreByQuizId(quizId);
        if (averageScore != null) {
            averageScore = averageScore.setScale(2, RoundingMode.HALF_UP);
        } else {
            averageScore = BigDecimal.ZERO;
        }

        QuizAnalyticsResponse analytics = new QuizAnalyticsResponse();
        analytics.setQuizId(quiz.getId());
        analytics.setTitle(quiz.getTitle());
        analytics.setTotalAttempts(totalAttempts);
        analytics.setPassedAttempts(passedAttempts);
        analytics.setFailedAttempts(failedAttempts);
        analytics.setPassRate(passRate);
        analytics.setAverageScore(averageScore);
        analytics.setTotalMarks(quiz.getTotalMarks());

        return analytics;
    }

    public void verifyOwnership(Long userId, Quiz quiz) {
        if (!quiz.getCreator().getId().equals(userId)) {
            throw new ForbiddenException("Access denied: You are not the creator of this quiz.");
        }
    }

    public QuizResponse mapToResponse(Quiz quiz) {
        QuizResponse response = new QuizResponse();
        response.setId(quiz.getId());
        response.setTitle(quiz.getTitle());
        response.setDescription(quiz.getDescription());
        response.setCategory(new CategoryResponse(
                quiz.getCategory().getId(), quiz.getCategory().getName(), quiz.getCategory().getDescription()
        ));
        response.setDifficulty(quiz.getDifficulty());
        response.setCreator(new UserResponse(
                quiz.getCreator().getId(), quiz.getCreator().getFullName(), quiz.getCreator().getEmail(), quiz.getCreator().getCreatedAt()
        ));
        response.setDurationMinutes(quiz.getDurationMinutes());
        response.setTotalMarks(quiz.getTotalMarks());
        response.setPassingMarks(quiz.getPassingMarks());
        response.setNegativeMarkingEnabled(quiz.getNegativeMarkingEnabled());
        response.setNegativeMarksPerWrong(quiz.getNegativeMarksPerWrong());
        response.setQuestionCount(quiz.getQuestionCount());
        response.setStatus(quiz.getStatus());
        response.setCreatedAt(quiz.getCreatedAt());
        response.setUpdatedAt(quiz.getUpdatedAt());
        response.setAttemptsCount(attemptRepository.countByQuizId(quiz.getId()));
        return response;
    }

    public QuizSummaryResponse mapToSummaryResponse(Quiz quiz) {
        QuizSummaryResponse summary = new QuizSummaryResponse();
        summary.setId(quiz.getId());
        summary.setTitle(quiz.getTitle());
        summary.setDescription(quiz.getDescription());
        summary.setCategoryName(quiz.getCategory().getName());
        summary.setCategoryId(quiz.getCategory().getId());
        summary.setDifficulty(quiz.getDifficulty());
        summary.setCreatorName(quiz.getCreator().getFullName());
        summary.setCreatorId(quiz.getCreator().getId());
        summary.setDurationMinutes(quiz.getDurationMinutes());
        summary.setTotalMarks(quiz.getTotalMarks());
        summary.setPassingMarks(quiz.getPassingMarks());
        summary.setNegativeMarkingEnabled(quiz.getNegativeMarkingEnabled());
        summary.setNegativeMarksPerWrong(quiz.getNegativeMarksPerWrong());
        summary.setQuestionCount(quiz.getQuestionCount());
        summary.setStatus(quiz.getStatus());
        summary.setCreatedAt(quiz.getCreatedAt());
        summary.setAttemptsCount(attemptRepository.countByQuizId(quiz.getId()));
        return summary;
    }
}
