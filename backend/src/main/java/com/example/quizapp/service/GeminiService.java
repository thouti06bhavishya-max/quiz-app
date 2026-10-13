package com.example.quizapp.service;

import com.example.quizapp.dto.AiExplainMistakeRequest;
import com.example.quizapp.dto.AiGenerateQuestionsRequest;
import com.example.quizapp.dto.QuestionRequest;
import com.example.quizapp.dto.QuestionResponse;
import com.example.quizapp.entity.Question;
import com.example.quizapp.entity.Quiz;
import com.example.quizapp.exception.BadRequestException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final QuestionService questionService;
    private final QuizService quizService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiService(QuestionService questionService,
                         QuizService quizService,
                         ObjectMapper objectMapper) {
        this.questionService = questionService;
        this.quizService = quizService;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public List<QuestionResponse> generateQuestionsForQuiz(Long userId, Long quizId, AiGenerateQuestionsRequest request) {
        Quiz quiz = quizService.getQuizEntity(quizId);
        quizService.verifyOwnership(userId, quiz);

        List<QuestionRequest> parsedQuestions;

        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            parsedQuestions = callGeminiForQuestions(request.getTopic(), request.getCount(), request.getDifficulty(), request.getMarks());
        } else {
            // Smart offline generator when no Gemini key is yet configured
            parsedQuestions = generateOfflineQuestions(request.getTopic(), request.getCount(), request.getMarks());
        }

        List<QuestionResponse> savedResponses = new ArrayList<>();
        for (QuestionRequest qReq : parsedQuestions) {
            savedResponses.add(questionService.addQuestion(userId, quizId, qReq));
        }

        return savedResponses;
    }

    public String explainMistake(AiExplainMistakeRequest request) {
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            return callGeminiForExplanation(request);
        } else {
            return generateOfflineExplanation(request);
        }
    }

    private List<QuestionRequest> callGeminiForQuestions(String topic, int count, String difficulty, int marks) {
        String prompt = String.format("""
            You are a senior computer science educator and examiner.
            Create %d multiple-choice questions on the topic: "%s".
            Difficulty: %s.
            Each question must have:
            - questionText: A clear, technically rigorous question statement.
            - optionA, optionB, optionC, optionD: 4 distinct, plausible choices.
            - correctAnswer: exactly one of "A", "B", "C", or "D".
            - explanation: A concise, insightful 1-2 sentence explanation of why the correct option is true and others are false.

            Return ONLY a valid JSON array of objects without additional commentary:
            [
              {
                "questionText": "...",
                "optionA": "...",
                "optionB": "...",
                "optionC": "...",
                "optionD": "...",
                "correctAnswer": "A",
                "explanation": "..."
              }
            ]
            """, count, topic, difficulty);

        try {
            String rawJson = callGeminiGenerateContent(prompt, true);
            // Clean markdown code block wraps if any
            String cleaned = cleanJsonString(rawJson);

            List<Map<String, Object>> list = objectMapper.readValue(cleaned, new TypeReference<>() {});
            List<QuestionRequest> results = new ArrayList<>();

            for (Map<String, Object> map : list) {
                QuestionRequest qr = new QuestionRequest();
                qr.setQuestionText(String.valueOf(map.getOrDefault("questionText", "Question")));
                qr.setOptionA(String.valueOf(map.getOrDefault("optionA", "Option A")));
                qr.setOptionB(String.valueOf(map.getOrDefault("optionB", "Option B")));
                qr.setOptionC(String.valueOf(map.getOrDefault("optionC", "Option C")));
                qr.setOptionD(String.valueOf(map.getOrDefault("optionD", "Option D")));
                String ans = String.valueOf(map.getOrDefault("correctAnswer", "A")).toUpperCase().trim();
                qr.setCorrectAnswer(Question.CorrectOption.valueOf(ans.substring(0, 1)));
                qr.setMarks(marks);
                qr.setExplanation(String.valueOf(map.getOrDefault("explanation", "")));
                results.add(qr);
            }

            return results;
        } catch (Exception e) {
            throw new BadRequestException("Gemini API generation error: " + e.getMessage());
        }
    }

    private String callGeminiForExplanation(AiExplainMistakeRequest request) {
        String prompt = String.format("""
            You are an encouraging and knowledgeable computer science tutor.
            A student made an error on the following question:
            Question: "%s"
            Correct Answer (%s): "%s"
            Student Chosen Option (%s): "%s"
            Standard Explanation: "%s"

            In 2 to 3 concise, friendly sentences, explain:
            1. Why the student's selected choice is a common misconception.
            2. The core principle that makes the correct option true.
            Do not use overly complex jargon. Be encouraging.
            """,
            request.getQuestionText(),
            request.getCorrectOption(),
            request.getCorrectOptionText(),
            request.getUserOption(),
            request.getUserOptionText(),
            request.getExplanation()
        );

        try {
            return callGeminiGenerateContent(prompt, false);
        } catch (Exception e) {
            return generateOfflineExplanation(request);
        }
    }

    private String callGeminiGenerateContent(String promptText, boolean requireJson) throws Exception {
        String endpoint = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                geminiModel, geminiApiKey.trim()
        );

        Map<String, Object> part = Map.of("text", promptText);
        Map<String, Object> content = Map.of("parts", List.of(part));

        Map<String, Object> body;
        if (requireJson) {
            body = Map.of(
                    "contents", List.of(content),
                    "generationConfig", Map.of(
                            "temperature", 0.3,
                            "responseMimeType", "application/json"
                    )
            );
        } else {
            body = Map.of(
                    "contents", List.of(content),
                    "generationConfig", Map.of("temperature", 0.5)
            );
        }

        String requestJson = objectMapper.writeValueAsString(body);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestJson))
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            throw new BadRequestException("Google Gemini API responded with status " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray() && !candidates.isEmpty()) {
            JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
            return textNode.asText();
        }

        throw new BadRequestException("No response content generated by Gemini.");
    }

    private String cleanJsonString(String raw) {
        String text = raw.trim();
        if (text.startsWith("```json")) {
            text = text.substring(7);
        } else if (text.startsWith("```")) {
            text = text.substring(3);
        }
        if (text.endsWith("```")) {
            text = text.substring(0, text.length() - 3);
        }
        return text.trim();
    }

    private List<QuestionRequest> generateOfflineQuestions(String topic, int count, int marks) {
        List<QuestionRequest> list = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            QuestionRequest qr = new QuestionRequest();
            qr.setQuestionText(String.format("Core Concept #%d in %s: Which principle represents standard best practice?", i, topic));
            qr.setOptionA(String.format("Modular separation of concerns and clear interfaces in %s", topic));
            qr.setOptionB(String.format("Monolithic coupling of state and logic in %s", topic));
            qr.setOptionC("Unrestricted global mutable variables");
            qr.setOptionD("Bypassing validation and exception handling");
            qr.setCorrectAnswer(Question.CorrectOption.A);
            qr.setMarks(marks);
            qr.setExplanation(String.format("Modular separation of concerns ensures testability, scalability, and maintainability in %s.", topic));
            list.add(qr);
        }
        return list;
    }

    private String generateOfflineExplanation(AiExplainMistakeRequest request) {
        return String.format(
            "While selecting option %s is a frequent mistake when thinking about %s, the correct answer is %s. %s",
            request.getUserOption() != null ? request.getUserOption() : "this choice",
            request.getQuestionText() != null && request.getQuestionText().length() > 30
                    ? request.getQuestionText().substring(0, 30) + "..." : "this problem",
            request.getCorrectOption() != null ? request.getCorrectOption() : "the designated answer",
            request.getExplanation() != null ? request.getExplanation() : "Make sure to review the core definition."
        );
    }
}
