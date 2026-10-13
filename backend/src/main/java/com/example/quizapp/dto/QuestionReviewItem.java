package com.example.quizapp.dto;

import com.example.quizapp.entity.Question;
import java.math.BigDecimal;

public class QuestionReviewItem {
    private Long questionId;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private Question.CorrectOption selectedOption;
    private Question.CorrectOption correctAnswer;
    private Boolean isCorrect;
    private BigDecimal marksAwarded;
    private Integer maxMarks;
    private String explanation;
    private Integer questionOrder;

    public QuestionReviewItem() {
    }

    // Getters and Setters
    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getOptionA() {
        return optionA;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public Question.CorrectOption getSelectedOption() {
        return selectedOption;
    }

    public void setSelectedOption(Question.CorrectOption selectedOption) {
        this.selectedOption = selectedOption;
    }

    public Question.CorrectOption getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(Question.CorrectOption correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public Boolean getIsCorrect() {
        return isCorrect;
    }

    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    public BigDecimal getMarksAwarded() {
        return marksAwarded;
    }

    public void setMarksAwarded(BigDecimal marksAwarded) {
        this.marksAwarded = marksAwarded;
    }

    public Integer getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(Integer maxMarks) {
        this.maxMarks = maxMarks;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }
}
