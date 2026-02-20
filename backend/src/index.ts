import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import lessonRouter from './routes/lesson';
import quizRouter from './routes/quiz';
import pushRouter from './routes/push';

import { initWebPush } from './services/push';
import { startDailyCron, generateDailyLesson, getSchedule, updateSchedule } from './cron/dailyLesson';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/lessons', lessonRouter);
app.use('/api/lesson', lessonRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/push', pushRouter);

// Schedule API
app.get('/api/schedule', (_req, res) => {
  res.json(getSchedule());
});

app.put('/api/schedule', (req, res) => {
  const { hour, minute } = req.body;
  if (hour == null || minute == null || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return res.status(400).json({ error: 'hour (0-23) and minute (0-59) are required' });
  }
  const settings = updateSchedule(hour, minute);
  res.json(settings);
});

// Manual trigger for daily lesson (dev/testing)
app.post('/api/trigger-daily', async (_req, res) => {
  try {
    const lesson = await generateDailyLesson();
    if (lesson) {
      res.json({ message: `Generated Day ${lesson.day}`, lesson });
    } else {
      res.json({ message: 'No lesson generated (curriculum complete or already generated)' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Initialize services
initWebPush();
startDailyCron();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
