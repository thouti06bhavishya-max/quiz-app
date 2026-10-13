package com.example.quizapp.service;

import com.example.quizapp.dto.*;
import com.example.quizapp.entity.*;
import com.example.quizapp.exception.BadRequestException;
import com.example.quizapp.exception.ForbiddenException;
import com.example.quizapp.exception.ResourceNotFoundException;
import com.example.quizapp.repository.AttemptAnswerRepository;
import com.example.quizapp.repository.QuestionRepository;
import com.example.quizapp.repository.QuizAttemptRepository;
import com.example.quizapp.repository.QuizRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final AttemptAnswerRepository answerRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final UserService userService;
    private final QuestionService questionService;
    private final NotificationService notificationService;

    public AttemptService(QuizAttemptRepository attemptRepository,
                          AttemptAnswerRepository answerRepository,
                          QuizRepository quizRepository,
                          QuestionRepository questionRepository,
                          UserService userService,
                          QuestionService questionService,
                          NotificationService notificationService) {
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.userService = userService;
        this.questionService = questionService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AttemptSessionResponse startAttempt(Long userId, Long quizId) {
        User user = userService.getUserEntity(userId);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        if (quiz.getStatus() != Quiz.QuizStatus.PUBLISHED) {
            throw new BadRequestException("This quiz is not published and cannot be attempted.");
        }

        if (quiz.getQuestionCount() == null || quiz.getQuestionCount() == 0) {
            throw new BadRequestException("This quiz has no questions.");
        }

        // Check if there is an existing in-progress attempt
        Optional<QuizAttempt> existingOpt = attemptRepository
                .findFirstByUserIdAndQuizIdAndStatusOrderByStartedAtDesc(userId, quizId, QuizAttempt.AttemptStatus.IN_PROGRESS);

        QuizAttempt attempt;
        if (existingOpt.isPresent()) {
            attempt = existingOpt.get();
            // If already expired, auto-submit it and start fresh
            if (LocalDateTime.now().isAfter(attempt.getExpiresAt())) {
                submitAttemptInternal(attempt);
                attempt = createNewAttempt(user, quiz);
            }
        } else {
            attempt = createNewAttempt(user, quiz);
        }

        return buildSessionResponse(attempt);
    }

    private QuizAttempt createNewAttempt(User user, Quiz quiz) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(quiz.getDurationMinutes());

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setQuiz(quiz);
        attempt.setStartedAt(now);
        attempt.setExpiresAt(expiresAt);
        attempt.setStatus(QuizAttempt.AttemptStatus.IN_PROGRESS);
        attempt.setTotalQuestions(quiz.getQuestionCount());
        attempt.setScore(BigDecimal.ZERO);
        attempt.setPercentage(BigDecimal.ZERO);
        attempt.setPassed(false);

        return attemptRepository.save(attempt);
    }

    public AttemptSessionResponse getAttemptSession(Long userId, Long attemptId) {
        QuizAttempt attempt = getAttemptAndVerifyOwnership(userId, attemptId);

        if (attempt.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("This attempt has already been submitted or expired.");
        }

        // Check if expired
        if (LocalDateTime.now().isAfter(attempt.getExpiresAt())) {
            submitAttemptInternal(attempt);
            throw new BadRequestException("Attempt time has expired and the quiz has been submitted.");
        }

        return buildSessionResponse(attempt);
    }

    @Transactional
    public void saveAnswer(Long userId, Long attemptId, SaveAnswerRequest request) {
        QuizAttempt attempt = getAttemptAndVerifyOwnership(userId, attemptId);

        if (attempt.getStatus() != QuizAttempt.AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Cannot save answers for an attempt that is already completed.");
        }

        // Validate time window (with a 5-second grace period for network latency)
        if (LocalDateTime.now().isAfter(attempt.getExpiresAt().plusSeconds(5))) {
            submitAttemptInternal(attempt);
            throw new BadRequestException("Time has expired. Your attempt has been automatically submitted.");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        if (!question.getQuiz().getId().equals(attempt.getQuiz().getId())) {
            throw new BadRequestException("Question does not belong to this quiz attempt.");
        }

        AttemptAnswer answer = answerRepository.findByAttemptIdAndQuestionId(attemptId, question.getId())
                .orElse(new AttemptAnswer());

        answer.setAttempt(attempt);
        answer.setQuestion(question);
        answer.setSelectedOption(request.getSelectedOption());
        answerRepository.save(answer);
    }

    @Transactional
    public AttemptResultResponse submitAttempt(Long userId, Long attemptId) {
        QuizAttempt attempt = getAttemptAndVerifyOwnership(userId, attemptId);

        if (attempt.getStatus() == QuizAttempt.AttemptStatus.SUBMITTED) {
            return mapToResultResponse(attempt);
        }

        return submitAttemptInternal(attempt);
    }

    @Transactional
    public AttemptResultResponse submitAttemptInternal(QuizAttempt attempt) {
        Quiz quiz = attempt.getQuiz();
        List<Question> questions = questionRepository.findByQuizIdOrderByQuestionOrderAsc(quiz.getId());
        List<AttemptAnswer> savedAnswers = answerRepository.findByAttemptId(attempt.getId());

        Map<Long, AttemptAnswer> answerMap = savedAnswers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a, (k1, k2) -> k1));

        int correctCount = 0;
        int wrongCount = 0;
        int unansweredCount = 0;
        BigDecimal totalScore = BigDecimal.ZERO;

        for (Question question : questions) {
            AttemptAnswer answer = answerMap.get(question.getId());

            if (answer == null || answer.getSelectedOption() == null) {
                unansweredCount++;
                if (answer == null) {
                    answer = new AttemptAnswer();
                    answer.setAttempt(attempt);
                    answer.setQuestion(question);
                    answer.setSelectedOption(null);
                }
                answer.setIsCorrect(false);
                answer.setMarksAwarded(BigDecimal.ZERO);
                answerRepository.save(answer);
            } else if (answer.getSelectedOption() == question.getCorrectAnswer()) {
                correctCount++;
                BigDecimal marks = BigDecimal.valueOf(question.getMarks());
                answer.setIsCorrect(true);
                answer.setMarksAwarded(marks);
                totalScore = totalScore.add(marks);
                answerRepository.save(answer);
            } else {
                wrongCount++;
                answer.setIsCorrect(false);
                if (Boolean.TRUE.equals(quiz.getNegativeMarkingEnabled()) && quiz.getNegativeMarksPerWrong() != null) {
                    BigDecimal deduction = quiz.getNegativeMarksPerWrong();
                    answer.setMarksAwarded(deduction.negate());
                    totalScore = totalScore.subtract(deduction);
                } else {
                    answer.setMarksAwarded(BigDecimal.ZERO);
                }
                answerRepository.save(answer);
            }
        }

        // Clamp minimum score at 0.00
        if (totalScore.compareTo(BigDecimal.ZERO) < 0) {
            totalScore = BigDecimal.ZERO;
        }

        BigDecimal percentage = BigDecimal.ZERO;
        if (quiz.getTotalMarks() != null && quiz.getTotalMarks() > 0) {
            percentage = totalScore
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(quiz.getTotalMarks()), 2, RoundingMode.HALF_UP);
        }

        boolean passed = totalScore.compareTo(BigDecimal.valueOf(quiz.getPassingMarks())) >= 0;

        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setStatus(QuizAttempt.AttemptStatus.SUBMITTED);
        attempt.setTotalQuestions(questions.size());
        attempt.setCorrectAnswers(correctCount);
        attempt.setWrongAnswers(wrongCount);
        attempt.setUnansweredQuestions(unansweredCount);
        attempt.setScore(totalScore.setScale(2, RoundingMode.HALF_UP));
        attempt.setPercentage(percentage);
        attempt.setPassed(passed);

        QuizAttempt savedAttempt = attemptRepository.save(attempt);

        // Generate notification
        notificationService.createNotification(
                savedAttempt.getUser(),
                "Quiz Result Available",
                String.format("You scored %s/%d (%s%%) in '%s'. Result: %s",
                        savedAttempt.getScore().toPlainString(),
                        quiz.getTotalMarks(),
                        savedAttempt.getPercentage().toPlainString(),
                        quiz.getTitle(),
                        passed ? "PASSED" : "FAILED"
                ),
                "RESULT_AVAILABLE"
        );

        return mapToResultResponse(savedAttempt);
    }

    public AttemptResultResponse getAttemptResult(Long userId, Long attemptId) {
        QuizAttempt attempt = getAttemptAndVerifyOwnership(userId, attemptId);

        if (attempt.getStatus() == QuizAttempt.AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("This attempt has not been submitted yet.");
        }

        return mapToResultResponse(attempt);
    }

    public AttemptReviewResponse getAttemptReview(Long userId, Long attemptId) {
        QuizAttempt attempt = getAttemptAndVerifyOwnership(userId, attemptId);

        if (attempt.getStatus() == QuizAttempt.AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("You cannot review answers before submitting the attempt.");
        }

        Quiz quiz = attempt.getQuiz();
        List<Question> questions = questionRepository.findByQuizIdOrderByQuestionOrderAsc(quiz.getId());
        List<AttemptAnswer> answers = answerRepository.findByAttemptId(attempt.getId());

        Map<Long, AttemptAnswer> answerMap = answers.stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a, (k1, k2) -> k1));

        List<QuestionReviewItem> reviewItems = questions.stream().map(q -> {
            AttemptAnswer ans = answerMap.get(q.getId());
            QuestionReviewItem item = new QuestionReviewItem();
            item.setQuestionId(q.getId());
            item.setQuestionText(q.getQuestionText());
            item.setOptionA(q.getOptionA());
            item.setOptionB(q.getOptionB());
            item.setOptionC(q.getOptionC());
            item.setOptionD(q.getOptionD());
            item.setCorrectAnswer(q.getCorrectAnswer());
            item.setMaxMarks(q.getMarks());
            item.setExplanation(q.getExplanation());
            item.setQuestionOrder(q.getQuestionOrder());

            if (ans != null) {
                item.setSelectedOption(ans.getSelectedOption());
                item.setIsCorrect(ans.getIsCorrect());
                item.setMarksAwarded(ans.getMarksAwarded());
            } else {
                item.setSelectedOption(null);
                item.setIsCorrect(false);
                item.setMarksAwarded(BigDecimal.ZERO);
            }

            return item;
        }).collect(Collectors.toList());

        AttemptReviewResponse review = new AttemptReviewResponse();
        review.setAttemptId(attempt.getId());
        review.setQuizId(quiz.getId());
        review.setQuizTitle(quiz.getTitle());
        review.setScore(attempt.getScore());
        review.setTotalMarks(quiz.getTotalMarks());
        review.setPassingMarks(quiz.getPassingMarks());
        review.setPercentage(attempt.getPercentage());
        review.setPassed(attempt.getPassed());
        review.setQuestions(reviewItems);

        return review;
    }

    public PagedResponse<AttemptSummaryResponse> getMyAttempts(Long userId, Pageable pageable) {
        Page<QuizAttempt> page = attemptRepository.findByUserIdOrderByStartedAtDesc(userId, pageable);

        List<AttemptSummaryResponse> list = page.getContent().stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                list,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    private QuizAttempt getAttemptAndVerifyOwnership(Long userId, Long attemptId) {
        QuizAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied: You cannot view or modify another user's attempt.");
        }

        return attempt;
    }

    private AttemptSessionResponse buildSessionResponse(QuizAttempt attempt) {
        Quiz quiz = attempt.getQuiz();
        List<QuestionTakerResponse> questions = questionService.getQuestionsForTaker(quiz.getId());

        List<AttemptAnswer> saved = answerRepository.findByAttemptId(attempt.getId());
        Map<Long, String> answersMap = new HashMap<>();
        for (AttemptAnswer ans : saved) {
            if (ans.getSelectedOption() != null) {
                answersMap.put(ans.getQuestion().getId(), ans.getSelectedOption().name());
            }
        }

        long remaining = Duration.between(LocalDateTime.now(), attempt.getExpiresAt()).getSeconds();
        if (remaining < 0) remaining = 0;

        AttemptSessionResponse session = new AttemptSessionResponse();
        session.setAttemptId(attempt.getId());
        session.setQuizId(quiz.getId());
        session.setQuizTitle(quiz.getTitle());
        session.setDurationMinutes(quiz.getDurationMinutes());
        session.setTotalMarks(quiz.getTotalMarks());
        session.setPassingMarks(quiz.getPassingMarks());
        session.setNegativeMarkingEnabled(quiz.getNegativeMarkingEnabled());
        session.setNegativeMarksPerWrong(quiz.getNegativeMarksPerWrong());
        session.setStartedAt(attempt.getStartedAt());
        session.setExpiresAt(attempt.getExpiresAt());
        session.setRemainingSeconds(remaining);
        session.setQuestions(questions);
        session.setSavedAnswers(answersMap);

        return session;
    }

    private AttemptResultResponse mapToResultResponse(QuizAttempt attempt) {
        Quiz quiz = attempt.getQuiz();
        long timeTakenSeconds = 0;
        if (attempt.getSubmittedAt() != null && attempt.getStartedAt() != null) {
            timeTakenSeconds = Duration.between(attempt.getStartedAt(), attempt.getSubmittedAt()).getSeconds();
        }

        AttemptResultResponse resp = new AttemptResultResponse();
        resp.setAttemptId(attempt.getId());
        resp.setQuizId(quiz.getId());
        resp.setQuizTitle(quiz.getTitle());
        resp.setTotalMarks(quiz.getTotalMarks());
        resp.setPassingMarks(quiz.getPassingMarks());
        resp.setScore(attempt.getScore());
        resp.setPercentage(attempt.getPercentage());
        resp.setPassed(attempt.getPassed());
        resp.setTotalQuestions(attempt.getTotalQuestions());
        resp.setCorrectAnswers(attempt.getCorrectAnswers());
        resp.setWrongAnswers(attempt.getWrongAnswers());
        resp.setUnansweredQuestions(attempt.getUnansweredQuestions());
        resp.setStartedAt(attempt.getStartedAt());
        resp.setSubmittedAt(attempt.getSubmittedAt());
        resp.setTimeTakenSeconds(timeTakenSeconds);
        resp.setNegativeMarkingEnabled(quiz.getNegativeMarkingEnabled());
        resp.setNegativeMarksPerWrong(quiz.getNegativeMarksPerWrong());

        return resp;
    }

    public AttemptSummaryResponse mapToSummaryResponse(QuizAttempt attempt) {
        Quiz quiz = attempt.getQuiz();
        long timeTaken = 0;
        if (attempt.getSubmittedAt() != null && attempt.getStartedAt() != null) {
            timeTaken = Duration.between(attempt.getStartedAt(), attempt.getSubmittedAt()).getSeconds();
        }

        AttemptSummaryResponse summary = new AttemptSummaryResponse();
        summary.setId(attempt.getId());
        summary.setQuizId(quiz.getId());
        summary.setQuizTitle(quiz.getTitle());
        summary.setCategoryName(quiz.getCategory().getName());
        summary.setDifficulty(quiz.getDifficulty());
        summary.setScore(attempt.getScore());
        summary.setTotalMarks(quiz.getTotalMarks());
        summary.setPassingMarks(quiz.getPassingMarks());
        summary.setPercentage(attempt.getPercentage());
        summary.setPassed(attempt.getPassed());
        summary.setStatus(attempt.getStatus());
        summary.setStartedAt(attempt.getStartedAt());
        summary.setSubmittedAt(attempt.getSubmittedAt());
        summary.setTimeTakenSeconds(timeTaken);

        return summary;
    }
}
