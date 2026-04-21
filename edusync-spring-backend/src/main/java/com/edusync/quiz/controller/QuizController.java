
// edusync-spring-backend/src/main/java/com/edusync/quiz/controller/QuizController.java
package com.edusync.quiz.controller;

import com.edusync.quiz.entity.Question;
import com.edusync.quiz.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {

    @Autowired
    private QuizService quizService;

    // ── GET /api/quiz/all ─────────────────────────────────────────────────────
    @GetMapping("/all")
    public ResponseEntity<List<Question>> getAllQuestions() {
        List<Question> questions = quizService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }

    // ── GET /api/quiz/random?count=10 ──────────────────────────────────────────
    @GetMapping("/random")
    public ResponseEntity<?> getRandomQuestions(
            @RequestParam(defaultValue = "10") int count) {

        if (count <= 0 || count > 50) {
            return ResponseEntity
                .badRequest()
                .body(Map.of("message", "count must be between 1 and 50"));
        }

        List<Question> questions = quizService.getRandomQuestions(count);

        if (questions.isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "No questions found in database. Use POST /api/quiz/add to seed questions."));
        }

        return ResponseEntity.ok(questions);
    }

    // ── POST /api/quiz/add ─────────────────────────────────────────────────────
    @PostMapping("/add")
    public ResponseEntity<Question> addQuestion(@Valid @RequestBody Question question) {
        Question saved = quizService.addQuestion(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── GET /api/quiz/topic/{topic} ────────────────────────────────────────────
    @GetMapping("/topic/{topic}")
    public ResponseEntity<List<Question>> getByTopic(@PathVariable String topic) {
        return ResponseEntity.ok(quizService.getQuestionsByTopic(topic));
    }

    // ── GET /api/quiz/difficulty/{level} ───────────────────────────────────────
    @GetMapping("/difficulty/{level}")
    public ResponseEntity<List<Question>> getByDifficulty(@PathVariable String level) {
        return ResponseEntity.ok(quizService.getQuestionsByDifficulty(level));
    }

    // ── GET /api/quiz/health ───────────────────────────────────────────────────
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "service", "EduSync Quiz API",
            "port", "8080"
        ));
    }
}