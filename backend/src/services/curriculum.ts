import fs from 'fs';
import path from 'path';
import type { QuizSet } from './gemini';

export interface DayTopic {
  day: number;
  title: string;
  grammar: string;
  description: string;
}

const CURRICULUM_PATH = path.join(__dirname, '../../data/curriculum.md');
const GENERATED_DIR = path.join(__dirname, '../../data/generated');

export function parseCurriculum(): DayTopic[] {
  const content = fs.readFileSync(CURRICULUM_PATH, 'utf-8');
  const lines = content.split('\n');
  const topics: DayTopic[] = [];

  let currentDay: Partial<DayTopic> | null = null;

  for (const line of lines) {
    const dayMatch = line.match(/^## Day (\d+): (.+)/);
    if (dayMatch) {
      if (currentDay && currentDay.day) {
        topics.push(currentDay as DayTopic);
      }
      currentDay = {
        day: parseInt(dayMatch[1]),
        title: dayMatch[2].trim(),
        grammar: dayMatch[2].split('(')[0].trim(),
        description: '',
      };
    } else if (currentDay && line.trim() && !line.startsWith('#')) {
      currentDay.description = line.trim();
    }
  }

  if (currentDay && currentDay.day) {
    topics.push(currentDay as DayTopic);
  }

  return topics;
}

export function getDayTopic(day: number): DayTopic | undefined {
  const topics = parseCurriculum();
  return topics.find((t) => t.day === day);
}

export function getTotalDays(): number {
  return parseCurriculum().length;
}

export interface GeneratedLesson {
  day: number;
  title: string;
  grammar: string;
  explanation: string;
  examples: Array<{
    japanese: string;
    reading: string;
    korean: string;
  }>;
  vocabulary: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>;
  generatedAt: string;
}

export function getCachedLesson(day: number): GeneratedLesson | null {
  const filePath = path.join(GENERATED_DIR, `day-${day}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

export function saveLesson(lesson: GeneratedLesson): void {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }
  const filePath = path.join(GENERATED_DIR, `day-${lesson.day}.json`);
  fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2), 'utf-8');
}

export function getGeneratedDays(): number[] {
  if (!fs.existsSync(GENERATED_DIR)) return [];
  return fs
    .readdirSync(GENERATED_DIR)
    .filter((f) => f.match(/^day-\d+\.json$/))
    .map((f) => parseInt(f.match(/\d+/)![0]))
    .sort((a, b) => a - b);
}

export function getCachedQuiz(day: number): QuizSet | null {
  const filePath = path.join(GENERATED_DIR, `quiz-day-${day}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

export function saveQuiz(quiz: QuizSet): void {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }
  const filePath = path.join(GENERATED_DIR, `quiz-day-${quiz.day}.json`);
  fs.writeFileSync(filePath, JSON.stringify(quiz, null, 2), 'utf-8');
}
