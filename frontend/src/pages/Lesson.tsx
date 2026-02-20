import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchLesson, LessonData, GradeResult } from '../services/api';
import { useStudyProgress } from '../hooks/useStudyProgress';
import { useLocalStorage } from '../hooks/useLocalStorage';
import GrammarView from '../components/GrammarView';

export default function Lesson() {
  const { day } = useParams<{ day: string }>();
  const dayNum = parseInt(day || '1');

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { markCompleted, getProgress } = useStudyProgress();
  const [quizResults] = useLocalStorage<GradeResult[] | null>(`quiz-results-${dayNum}`, null);

  const progress = getProgress(dayNum);

  useEffect(() => {
    setLoading(true);
    setError('');
    setLesson(null);

    fetchLesson(dayNum)
      .then(setLesson)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dayNum]);

  useEffect(() => {
    if (lesson && !progress) {
      markCompleted(dayNum);
    }
  }, [lesson, dayNum, progress, markCompleted]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-text-muted text-sm">Day {dayNum} 레슨 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 text-center">
          <div className="text-error font-medium mb-2">오류 발생</div>
          <div className="text-sm text-text-muted mb-4">{error}</div>
          <Link to="/" className="text-primary text-sm hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <GrammarView lesson={lesson} />

      {/* Action Buttons */}
      <Link
        to={`/quiz/${dayNum}`}
        className="block py-3 rounded-xl bg-primary text-white text-center text-sm font-medium hover:bg-primary-dark transition-colors"
      >
        작문 퀴즈 풀기
      </Link>

      {/* Quiz Results Summary */}
      {quizResults && (
        <div className="bg-bg-card rounded-xl p-4">
          <h3 className="text-sm font-medium text-primary mb-2">퀴즈 결과</h3>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">
              {Math.round(quizResults.reduce((s, r) => s + r.score, 0) / quizResults.length)}
              <span className="text-sm text-text-muted font-normal">/100</span>
            </div>
            <div className="flex gap-1">
              {quizResults.map((r) => (
                <span
                  key={r.questionId}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    r.isCorrect ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                  }`}
                >
                  Q{r.questionId}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        {dayNum > 1 ? (
          <Link
            to={`/lesson/${dayNum - 1}`}
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            ← Day {dayNum - 1}
          </Link>
        ) : (
          <div />
        )}
        <Link
          to={`/lesson/${dayNum + 1}`}
          className="text-sm text-text-muted hover:text-text transition-colors"
        >
          Day {dayNum + 1} →
        </Link>
      </div>
    </div>
  );
}
