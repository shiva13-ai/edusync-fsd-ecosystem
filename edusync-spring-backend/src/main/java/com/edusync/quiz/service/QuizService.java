
// edusync-spring-backend/src/main/java/com/edusync/quiz/service/QuizService.java
package com.edusync.quiz.service;

import com.edusync.quiz.entity.Question;
import com.edusync.quiz.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class QuizService {

    @Autowired
    private QuestionRepository questionRepository;

    /**
     * Returns all questions in the database.
     */
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    /**
     * Returns a randomized subset of `count` questions.
     * If the database has fewer than `count` questions, returns all available.
     */
    public List<Question> getRandomQuestions(int count) {
        List<Question> all = new ArrayList<>(questionRepository.findAll());
        Collections.shuffle(all);
        int limit = Math.min(count, all.size());
        return all.subList(0, limit);
    }

    /**
     * Persists a new question document to MongoDB.
     */
    public Question addQuestion(Question question) {
        return questionRepository.save(question);
    }

    /**
     * Returns questions filtered by topic.
     */
    public List<Question> getQuestionsByTopic(String topic) {
        return questionRepository.findByTopic(topic);
    }

    /**
     * Returns questions filtered by difficulty level.
     */
    public List<Question> getQuestionsByDifficulty(String difficultyLevel) {
        return questionRepository.findByDifficultyLevel(difficultyLevel);
    }
}