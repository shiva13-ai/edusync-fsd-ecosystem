
// edusync-spring-backend/src/main/java/com/edusync/quiz/entity/Question.java
package com.edusync.quiz.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "questions")
public class Question {

    @Id
    private String id;

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotBlank(message = "Option A is required")
    private String optionA;

    @NotBlank(message = "Option B is required")
    private String optionB;

    @NotBlank(message = "Option C is required")
    private String optionC;

    @NotBlank(message = "Option D is required")
    private String optionD;

    // Must be one of: optionA, optionB, optionC, optionD
    @NotBlank(message = "Correct answer is required")
    @Pattern(regexp = "optionA|optionB|optionC|optionD",
             message = "correctAnswer must be 'optionA', 'optionB', 'optionC', or 'optionD'")
    private String correctAnswer;

    @NotBlank(message = "Difficulty level is required")
    @Pattern(regexp = "Easy|Medium|Hard",
             message = "difficultyLevel must be 'Easy', 'Medium', or 'Hard'")
    private String difficultyLevel;

    // ── Constructors ──────────────────────────────────────────────────────────

    public Question() {}

    public Question(String topic, String questionText,
                    String optionA, String optionB, String optionC, String optionD,
                    String correctAnswer, String difficultyLevel) {
        this.topic = topic;
        this.questionText = questionText;
        this.optionA = optionA;
        this.optionB = optionB;
        this.optionC = optionC;
        this.optionD = optionD;
        this.correctAnswer = correctAnswer;
        this.difficultyLevel = difficultyLevel;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String getId()                          { return id; }
    public void   setId(String id)                 { this.id = id; }

    public String getTopic()                       { return topic; }
    public void   setTopic(String topic)           { this.topic = topic; }

    public String getQuestionText()                { return questionText; }
    public void   setQuestionText(String t)        { this.questionText = t; }

    public String getOptionA()                     { return optionA; }
    public void   setOptionA(String optionA)       { this.optionA = optionA; }

    public String getOptionB()                     { return optionB; }
    public void   setOptionB(String optionB)       { this.optionB = optionB; }

    public String getOptionC()                     { return optionC; }
    public void   setOptionC(String optionC)       { this.optionC = optionC; }

    public String getOptionD()                     { return optionD; }
    public void   setOptionD(String optionD)       { this.optionD = optionD; }

    public String getCorrectAnswer()               { return correctAnswer; }
    public void   setCorrectAnswer(String ca)      { this.correctAnswer = ca; }

    public String getDifficultyLevel()             { return difficultyLevel; }
    public void   setDifficultyLevel(String dl)    { this.difficultyLevel = dl; }
}