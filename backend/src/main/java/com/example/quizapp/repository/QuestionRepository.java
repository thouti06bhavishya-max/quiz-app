package com.example.quizapp.repository;

import com.example.quizapp.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByQuizIdOrderByQuestionOrderAsc(Long quizId);

    long countByQuizId(Long quizId);

    void deleteByQuizId(Long quizId);
}
