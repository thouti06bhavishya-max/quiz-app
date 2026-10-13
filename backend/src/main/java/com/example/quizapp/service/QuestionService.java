package com.example.quizapp.service;

import com.example.quizapp.dto.QuestionRequest;
import com.example.quizapp.dto.QuestionResponse;
import com.example.quizapp.dto.QuestionTakerResponse;
import com.example.quizapp.entity.Question;
import com.example.quizapp.entity.Quiz;
import com.example.quizapp.exception.ForbiddenException;
import com.example.quizapp.exception.ResourceNotFoundException;
import com.example.quizapp.repository.QuestionRepository;
import com.example.quizapp.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;
    private final QuizService quizService;

    public QuestionService(QuestionRepository questionRepository,
                           QuizRepository quizRepository,
                           QuizService quizService) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
        this.quizService = quizService;
    }

    public List<QuestionResponse> getQuestionsForQuizCreator(Long userId, Long quizId) {
        Quiz quiz = quizService.getQuizEntity(quizId);
        quizService.verifyOwnership(userId, quiz);

        return questionRepository.findByQuizIdOrderByQuestionOrderAsc(quizId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionTakerResponse> getQuestionsForTaker(Long quizId) {
        return questionRepository.findByQuizIdOrderByQuestionOrderAsc(quizId).stream()
                .map(this::mapToTakerResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public QuestionResponse addQuestion(Long userId, Long quizId, QuestionRequest request) {
        Quiz quiz = quizService.getQuizEntity(quizId);
        quizService.verifyOwnership(userId, quiz);

        Question question = new Question();
        question.setQuiz(quiz);
        question.setQuestionText(request.getQuestionText().trim());
        question.setOptionA(request.getOptionA().trim());
        question.setOptionB(request.getOptionB().trim());
        question.setOptionC(request.getOptionC().trim());
        question.setOptionD(request.getOptionD().trim());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setMarks(request.getMarks() != null && request.getMarks() > 0 ? request.getMarks() : 1);
        question.setExplanation(request.getExplanation());

        long currentCount = questionRepository.countByQuizId(quizId);
        question.setQuestionOrder((int) currentCount + 1);

        Question saved = questionRepository.save(question);
        syncQuizMetrics(quiz);

        return mapToResponse(saved);
    }

    @Transactional
    public QuestionResponse updateQuestion(Long userId, Long questionId, QuestionRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        quizService.verifyOwnership(userId, question.getQuiz());

        question.setQuestionText(request.getQuestionText().trim());
        question.setOptionA(request.getOptionA().trim());
        question.setOptionB(request.getOptionB().trim());
        question.setOptionC(request.getOptionC().trim());
        question.setOptionD(request.getOptionD().trim());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setMarks(request.getMarks() != null && request.getMarks() > 0 ? request.getMarks() : 1);
        question.setExplanation(request.getExplanation());

        if (request.getQuestionOrder() != null && request.getQuestionOrder() > 0) {
            question.setQuestionOrder(request.getQuestionOrder());
        }

        Question saved = questionRepository.save(question);
        syncQuizMetrics(question.getQuiz());

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteQuestion(Long userId, Long questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        Quiz quiz = question.getQuiz();
        quizService.verifyOwnership(userId, quiz);

        questionRepository.delete(question);

        // Reorder remaining questions
        List<Question> remaining = questionRepository.findByQuizIdOrderByQuestionOrderAsc(quiz.getId());
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setQuestionOrder(i + 1);
        }
        questionRepository.saveAll(remaining);

        syncQuizMetrics(quiz);
    }

    private void syncQuizMetrics(Quiz quiz) {
        List<Question> questions = questionRepository.findByQuizIdOrderByQuestionOrderAsc(quiz.getId());
        int totalMarks = questions.stream().mapToInt(Question::getMarks).sum();
        quiz.setQuestionCount(questions.size());
        quiz.setTotalMarks(totalMarks);
        quizRepository.save(quiz);
    }

    public QuestionResponse mapToResponse(Question q) {
        QuestionResponse resp = new QuestionResponse();
        resp.setId(q.getId());
        resp.setQuestionText(q.getQuestionText());
        resp.setOptionA(q.getOptionA());
        resp.setOptionB(q.getOptionB());
        resp.setOptionC(q.getOptionC());
        resp.setOptionD(q.getOptionD());
        resp.setCorrectAnswer(q.getCorrectAnswer());
        resp.setMarks(q.getMarks());
        resp.setExplanation(q.getExplanation());
        resp.setQuestionOrder(q.getQuestionOrder());
        return resp;
    }

    public QuestionTakerResponse mapToTakerResponse(Question q) {
        return new QuestionTakerResponse(
                q.getId(),
                q.getQuestionText(),
                q.getOptionA(),
                q.getOptionB(),
                q.getOptionC(),
                q.getOptionD(),
                q.getMarks(),
                q.getQuestionOrder()
        );
    }
}
