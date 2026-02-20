import { useLocalStorage } from './useLocalStorage';

interface DayProgress {
  completedAt: string;
  quizScore?: number;
}

interface StudyProgress {
  [day: string]: DayProgress;
}

export function useStudyProgress() {
  const [progress, setProgress] = useLocalStorage<StudyProgress>('study-progress', {});

  const markCompleted = (day: number, quizScore?: number) => {
    setProgress((prev) => ({
      ...prev,
      [day]: {
        completedAt: new Date().toISOString(),
        quizScore: quizScore ?? prev[day]?.quizScore,
      },
    }));
  };

  const getProgress = (day: number): DayProgress | undefined => {
    return progress[day];
  };

  const getCompletedDays = (): number[] => {
    return Object.keys(progress)
      .map(Number)
      .sort((a, b) => a - b);
  };

  const getTotalCompleted = (): number => {
    return Object.keys(progress).length;
  };

  const getAverageScore = (): number | null => {
    const scores = Object.values(progress)
      .map((p) => p.quizScore)
      .filter((s): s is number => s !== undefined);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  return {
    progress,
    markCompleted,
    getProgress,
    getCompletedDays,
    getTotalCompleted,
    getAverageScore,
  };
}
