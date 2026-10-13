package com.example.quizapp.repository;

import com.example.quizapp.entity.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Page<Quiz> findByCreatorId(Long creatorId, Pageable pageable);

    List<Quiz> findTop5ByCreatorIdOrderByCreatedAtDesc(Long creatorId);

    long countByCreatorId(Long creatorId);

    @Query("SELECT q FROM Quiz q WHERE q.status = 'PUBLISHED' " +
           "AND (:categoryId IS NULL OR q.category.id = :categoryId) " +
           "AND (:difficulty IS NULL OR q.difficulty = :difficulty) " +
           "AND (:search IS NULL OR LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Quiz> findPublishedQuizzes(
            @Param("categoryId") Long categoryId,
            @Param("difficulty") Quiz.Difficulty difficulty,
            @Param("search") String search,
            Pageable pageable
    );

    List<Quiz> findTop6ByStatusOrderByCreatedAtDesc(Quiz.QuizStatus status);

    long countByStatus(Quiz.QuizStatus status);
}
