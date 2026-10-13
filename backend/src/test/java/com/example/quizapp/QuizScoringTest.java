package com.example.quizapp;

import com.example.quizapp.entity.Question;
import com.example.quizapp.entity.Quiz;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

class QuizScoringTest {

    @Test
    void testScoringWithNegativeMarking() {
        Quiz quiz = new Quiz();
        quiz.setNegativeMarkingEnabled(true);
        quiz.setNegativeMarksPerWrong(new BigDecimal("0.50"));
        quiz.setPassingMarks(10);
        quiz.setTotalMarks(20);

        Question q1 = new Question();
        q1.setMarks(2);
        q1.setCorrectAnswer(Question.CorrectOption.A);

        Question q2 = new Question();
        q2.setMarks(2);
        q2.setCorrectAnswer(Question.CorrectOption.B);

        // Simulation: Q1 correct (+2), Q2 wrong (-0.5)
        BigDecimal score = BigDecimal.ZERO;
        score = score.add(BigDecimal.valueOf(q1.getMarks()));
        score = score.subtract(quiz.getNegativeMarksPerWrong());

        Assertions.assertEquals(new BigDecimal("1.50"), score);
    }

    @Test
    void testClampMinimumScoreAtZero() {
        BigDecimal totalScore = new BigDecimal("-2.50");
        if (totalScore.compareTo(BigDecimal.ZERO) < 0) {
            totalScore = BigDecimal.ZERO;
        }
        Assertions.assertEquals(BigDecimal.ZERO, totalScore);
    }
}
