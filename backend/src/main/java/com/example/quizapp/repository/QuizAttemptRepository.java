package com.example.quizapp.repository;

import com.example.quizapp.entity.QuizAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    Page<QuizAttempt> findByUserIdOrderByStartedAtDesc(Long userId, Pageable pageable);

    List<QuizAttempt> findTop5ByUserIdOrderByStartedAtDesc(Long userId);

    List<QuizAttempt> findByUserIdAndStatusOrderByStartedAtDesc(Long userId, QuizAttempt.AttemptStatus status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, QuizAttempt.AttemptStatus status);

    long countByQuizId(Long quizId);

    long countByQuizIdAndStatus(Long quizId, QuizAttempt.AttemptStatus status);

    @Query("SELECT AVG(a.score) FROM QuizAttempt a WHERE a.user.id = :userId AND a.status = 'SUBMITTED'")
    BigDecimal findAverageScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(a.score) FROM QuizAttempt a WHERE a.user.id = :userId AND a.status = 'SUBMITTED'")
    BigDecimal findMaxScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(a.score) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.status = 'SUBMITTED'")
    BigDecimal findAverageScoreByQuizId(@Param("quizId") Long quizId);

    @Query("SELECT COUNT(a) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.passed = true AND a.status = 'SUBMITTED'")
    long countPassedByQuizId(@Param("quizId") Long quizId);

    // Quiz leaderboard: best submitted attempt per user for a specific quiz
    @Query("SELECT a FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.status = 'SUBMITTED' " +
           "AND a.id IN (" +
           "  SELECT a2.id FROM QuizAttempt a2 WHERE a2.quiz.id = :quizId AND a2.status = 'SUBMITTED' " +
           "  AND a2.score = (SELECT MAX(a3.score) FROM QuizAttempt a3 WHERE a3.quiz.id = :quizId AND a3.user.id = a2.user.id AND a3.status = 'SUBMITTED')" +
           ") ORDER BY a.score DESC, a.submittedAt ASC")
    List<QuizAttempt> findQuizLeaderboard(@Param("quizId") Long quizId, Pageable pageable);

    // Global leaderboard: aggregate stats per user
    @Query("SELECT a.user.id as userId, a.user.fullName as fullName, " +
           "SUM(a.score) as totalScore, AVG(a.percentage) as avgPercentage, " +
           "COUNT(a.id) as attemptsCount, " +
           "SUM(CASE WHEN a.passed = true THEN 1 ELSE 0 END) as passedCount " +
           "FROM QuizAttempt a WHERE a.status = 'SUBMITTED' " +
           "GROUP BY a.user.id, a.user.fullName " +
           "ORDER BY totalScore DESC, passedCount DESC")
    List<Object[]> findGlobalLeaderboardRaw(Pageable pageable);

    Optional<QuizAttempt> findFirstByUserIdAndQuizIdAndStatusOrderByStartedAtDesc(
            Long userId, Long quizId, QuizAttempt.AttemptStatus status);
}
