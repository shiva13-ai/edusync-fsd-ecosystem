
// edusync-spring-backend/src/main/java/com/edusync/quiz/repository/QuestionRepository.java
package com.edusync.quiz.repository;

import com.edusync.quiz.entity.Question;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {

    // Find all questions for a given topic
    List<Question> findByTopic(String topic);

    // Find questions by difficulty
    List<Question> findByDifficultyLevel(String difficultyLevel);

    // Find by topic AND difficulty
    List<Question> findByTopicAndDifficultyLevel(String topic, String difficultyLevel);
}