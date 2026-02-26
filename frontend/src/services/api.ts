const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Lesson APIs
export interface LessonData {
  day: number;
  title: string;
  grammar: string;
  explanation: string;
  examples: Array<{ japanese: string; reading: string; korean: string }>;
  vocabulary: Array<{ word: string; reading: string; meaning: string }>;
  generatedAt: string;
}

export interface LessonSummary {
  day: number;
  title: string;
  grammar: string;
  generatedAt: string | null;
}

export interface LessonsListResponse {
  lessons: LessonSummary[];
  totalDays: number;
  completedDays: number;
}

export function fetchLessons(): Promise<LessonsListResponse> {
  return request('/lessons');
}

export function fetchLesson(day: number): Promise<LessonData> {
  return request(`/lesson/${day}`);
}

// Quiz APIs
export interface QuizQuestion {
  id: number;
  korean: string;
  hint: string;
}

export interface QuizSet {
  day: number;
  grammar: string;
  questions: QuizQuestion[];
}

export function generateQuiz(day: number, regenerate?: boolean): Promise<QuizSet> {
  return request('/quiz/generate', {
    method: 'POST',
    body: JSON.stringify({ day, regenerate }),
  });
}

export interface GradeResult {
  questionId: number;
  korean: string;
  userAnswer: string;
  isCorrect: boolean;
  score: number;
  correction: string;
  modelAnswer: string;
  feedback: string;
}

export interface GradeResponse {
  day: number;
  results: GradeResult[];
}

export function gradeQuiz(
  day: number,
  answers: Array<{ questionId: number; korean: string; answer: string }>
): Promise<GradeResponse> {
  return request('/quiz/grade', {
    method: 'POST',
    body: JSON.stringify({ day, answers }),
  });
}

// Push APIs
export function getVapidKey(): Promise<{ publicKey: string }> {
  return request('/push/vapid-key');
}

export function subscribePush(subscription: PushSubscription): Promise<{ message: string }> {
  return request('/push/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription.toJSON()),
  });
}

export function unsubscribePush(endpoint: string): Promise<{ message: string }> {
  return request('/push/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
  });
}


// Schedule APIs
export interface Schedule {
  hour: number;
  minute: number;
  timezone: string;
}

export function getSchedule(): Promise<Schedule> {
  return request('/schedule');
}

export function updateSchedule(hour: number, minute: number): Promise<Schedule> {
  return request('/schedule', {
    method: 'PUT',
    body: JSON.stringify({ hour, minute }),
  });
}
