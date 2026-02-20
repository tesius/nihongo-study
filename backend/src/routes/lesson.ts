import { Router } from 'express';
import {
  getDayTopic,
  getCachedLesson,
  saveLesson,
  getGeneratedDays,
  getTotalDays,
  parseCurriculum,
} from '../services/curriculum';
import { generateLesson } from '../services/gemini';

const router = Router();

// GET /api/lessons - List all generated lessons (for archive)
router.get('/', (_req, res) => {
  try {
    const generatedDays = getGeneratedDays();
    const curriculum = parseCurriculum();
    const totalDays = getTotalDays();

    const lessons = generatedDays.map((day) => {
      const topic = curriculum.find((t) => t.day === day);
      const cached = getCachedLesson(day);
      return {
        day,
        title: topic?.title || `Day ${day}`,
        grammar: topic?.grammar || '',
        generatedAt: cached?.generatedAt || null,
      };
    });

    res.json({ lessons, totalDays, completedDays: generatedDays.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/lesson/:day - Get specific lesson
router.get('/:day', async (req, res) => {
  try {
    const day = parseInt(req.params.day);
    if (isNaN(day) || day < 1) {
      return res.status(400).json({ error: 'Invalid day number' });
    }

    const topic = getDayTopic(day);
    if (!topic) {
      return res.status(404).json({ error: `Day ${day} not found in curriculum` });
    }

    // Check cache first
    const cached = getCachedLesson(day);
    if (cached) {
      return res.json(cached);
    }

    // Generate if not cached
    console.log(`Generating lesson for Day ${day}: ${topic.title}`);
    const lesson = await generateLesson(topic);
    saveLesson(lesson);

    res.json(lesson);
  } catch (err: any) {
    console.error(`Error generating lesson:`, err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
