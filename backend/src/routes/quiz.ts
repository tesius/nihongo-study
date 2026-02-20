import { Router } from 'express';
import { getCachedLesson } from '../services/curriculum';
import { generateQuiz, gradeQuiz } from '../services/gemini';

const router = Router();

// POST /api/quiz/generate - Generate quiz for a day
router.post('/generate', async (req, res) => {
  try {
    const { day } = req.body;
    if (!day) {
      return res.status(400).json({ error: 'day is required' });
    }

    const lesson = getCachedLesson(day);
    if (!lesson) {
      return res.status(404).json({ error: `Lesson for Day ${day} not found. Generate the lesson first.` });
    }

    const quiz = await generateQuiz(lesson);
    res.json(quiz);
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quiz/grade - Grade quiz answers
router.post('/grade', async (req, res) => {
  try {
    const { day, answers } = req.body;
    if (!day || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'day and answers[] are required' });
    }

    const lesson = getCachedLesson(day);
    if (!lesson) {
      return res.status(404).json({ error: `Lesson for Day ${day} not found` });
    }

    const results = await gradeQuiz(lesson, answers);
    res.json({ day, results });
  } catch (err: any) {
    console.error('Quiz grading error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
