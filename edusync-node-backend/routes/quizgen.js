// edusync-node-backend/routes/quizgen.js
const express                        = require('express');
const router                         = express.Router();
const { GoogleGenerativeAI }         = require('@google/generative-ai');
const axios                          = require('axios');
const { protect }                    = require('../middleware/authMiddleware');

const SPRING_API = process.env.SPRING_BOOT_API || 'http://localhost:8080';

// ── Strip markdown code fences that Gemini sometimes adds ─────────────────────
function extractJSON(text) {
  let s = text.trim();
  // Remove ```json ... ``` or ``` ... ```
  if (s.startsWith('```json')) s = s.slice(7);
  else if (s.startsWith('```'))  s = s.slice(3);
  const endFence = s.lastIndexOf('```');
  if (endFence !== -1) s = s.slice(0, endFence);
  return s.trim();
}

// ── Validate a single question object ─────────────────────────────────────────
const VALID_OPTIONS = ['optionA', 'optionB', 'optionC', 'optionD'];

function validateQuestion(q, idx) {
  const required = ['questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'];
  const missing  = required.filter(f => !q[f]?.toString().trim());
  if (missing.length) {
    throw new Error(`Q${idx + 1} missing fields: ${missing.join(', ')}`);
  }
  if (!VALID_OPTIONS.includes(q.correctAnswer)) {
    throw new Error(
      `Q${idx + 1}: correctAnswer "${q.correctAnswer}" must be optionA / optionB / optionC / optionD`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quizgen/generate
// ─────────────────────────────────────────────────────────────────────────────
router.post('/generate', protect, async (req, res) => {
  const {
    subject,
    syllabusText,
    questionCount           = 10,
    difficultyLevel         = 'Medium',
    additionalInstructions  = '',
  } = req.body;

  if (!subject?.trim() || !syllabusText?.trim()) {
    return res.status(400).json({ message: 'subject and syllabusText are required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return res.status(500).json({
      message: 'GEMINI_API_KEY is not configured. Add it to your .env file.',
      hint:    'Get a free key at https://aistudio.google.com/app/apikey',
    });
  }

  const count     = Math.min(Math.max(parseInt(questionCount) || 10, 1), 20);
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // ── Build the prompt ──────────────────────────────────────────────────────
  const prompt = `You are an expert educator and exam paper designer. Generate exactly ${count} multiple choice questions from the academic content below.

Subject: ${subject}
Difficulty: ${difficultyLevel}
${additionalInstructions ? `Special Instructions: ${additionalInstructions}` : ''}

=== SYLLABUS / CONTENT ===
${syllabusText}
=========================

RULES:
1. Test conceptual understanding, application, and analysis — not rote memorisation.
2. All 4 options must be plausible. Incorrect options should reflect common misconceptions.
3. Exactly ONE option must be unambiguously correct.
4. Distribute questions evenly across all topics listed in the syllabus.
5. "correctAnswer" must be exactly one of: "optionA", "optionB", "optionC", "optionD"
6. "difficultyLevel" must be exactly one of: "Easy", "Medium", "Hard"

CRITICAL OUTPUT FORMAT:
Return ONLY a raw JSON array — no markdown, no explanation, no prose. 
The response must be directly parseable by JSON.parse() without any pre-processing.

[
  {
    "topic": "Exact sub-topic name from the syllabus",
    "questionText": "A complete, grammatically correct question ending with ?",
    "optionA": "First choice",
    "optionB": "Second choice",
    "optionC": "Third choice",
    "optionD": "Fourth choice",
    "correctAnswer": "optionB",
    "difficultyLevel": "${difficultyLevel === 'Mixed' ? 'Easy or Medium or Hard (vary across questions)' : difficultyLevel}"
  }
]`;

  try {
    // ── Initialise Gemini client ──────────────────────────────────────────
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        // Force Gemini to output JSON only
        responseMimeType: 'application/json',
        temperature:      0.7,
        topP:             0.9,
        maxOutputTokens:  4096,
      },
    });

    const result  = await model.generateContent(prompt);
    const rawText = result.response.text();

    // ── Parse & validate ──────────────────────────────────────────────────
    const jsonString = extractJSON(rawText);
    const questions  = JSON.parse(jsonString);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Gemini returned an empty or non-array response');
    }

    questions.forEach(validateQuestion);

    const sanitized = questions.map(q => ({
      topic:           q.topic?.trim()          || subject,
      questionText:    q.questionText.trim(),
      optionA:         q.optionA.trim(),
      optionB:         q.optionB.trim(),
      optionC:         q.optionC.trim(),
      optionD:         q.optionD.trim(),
      correctAnswer:   q.correctAnswer,
      difficultyLevel: ['Easy', 'Medium', 'Hard'].includes(q.difficultyLevel)
                         ? q.difficultyLevel
                         : difficultyLevel,
    }));

    res.json({
      message:   `Generated ${sanitized.length} questions for "${subject}"`,
      questions: sanitized,
      meta: {
        subject,
        difficultyLevel,
        requestedCount: count,
        generatedCount: sanitized.length,
        model:          modelName,
        provider:       'Google Gemini',
        generatedAt:    new Date().toISOString(),
        generatedBy:    req.user.name,
      },
    });

  } catch (err) {
    // ── Gemini-specific error codes ───────────────────────────────────────
    if (err.message?.includes('API_KEY_INVALID') || err.status === 400) {
      return res.status(401).json({
        message: 'Invalid Gemini API key. Check your .env file.',
        hint:    'Visit https://aistudio.google.com/app/apikey to get a valid key.',
      });
    }
    if (err.message?.includes('RESOURCE_EXHAUSTED') || err.status === 429) {
      return res.status(429).json({
        message: 'Gemini API quota exceeded. Please wait and try again.',
        hint:    'Free tier: 15 requests/min for Flash, 2 requests/min for Pro.',
      });
    }
    if (err.message?.includes('SAFETY') || err.message?.includes('blocked')) {
      return res.status(422).json({
        message: 'Gemini blocked this request due to safety filters.',
        hint:    'Try rephrasing the syllabus content.',
      });
    }
    if (err instanceof SyntaxError) {
      return res.status(500).json({
        message: 'Gemini returned malformed JSON. Please try again.',
        raw:     err.message,
      });
    }

    console.error('[QuizGen Error]', err);
    res.status(500).json({ message: 'AI generation failed', error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/quizgen/save-to-bank
// Save generated questions to Spring Boot Quiz Bank
// ─────────────────────────────────────────────────────────────────────────────
router.post('/save-to-bank', protect, async (req, res) => {
  const { questions } = req.body;

  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: 'questions[] array is required and must not be empty' });
  }

  const results = { saved: 0, failed: 0, errors: [] };

  for (const q of questions) {
    try {
      await axios.post(`${SPRING_API}/api/quiz/add`, q, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
      });
      results.saved++;
    } catch (err) {
      results.failed++;
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      results.errors.push(msg);
    }
  }

  const status = results.failed === 0 ? 200 : results.saved === 0 ? 500 : 207;
  res.status(status).json({
    message: `Saved ${results.saved} of ${questions.length} questions to Quiz Bank`,
    ...results,
  });
});

module.exports = router;