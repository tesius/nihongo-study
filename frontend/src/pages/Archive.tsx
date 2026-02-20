import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLessons, LessonSummary } from '../services/api';
import { useStudyProgress } from '../hooks/useStudyProgress';
import ProgressBar from '../components/ProgressBar';

export default function Archive() {
  const [lessons, setLessons] = useState<LessonSummary[]>([]);
  const [totalDays, setTotalDays] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getProgress } = useStudyProgress();

  useEffect(() => {
    fetchLessons()
      .then((data) => {
        setLessons(data.lessons);
        setTotalDays(data.totalDays);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-muted animate-pulse">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h2 className="text-lg font-bold">아카이브</h2>

      <ProgressBar current={lessons.length} total={totalDays} label="전체 커리큘럼" />

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-3 text-sm text-error">
          {error}
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="bg-bg-card rounded-xl p-8 text-center">
          <div className="text-2xl mb-2">📭</div>
          <p className="text-text-muted">아직 생성된 레슨이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...lessons].reverse().map((lesson) => {
            const progress = getProgress(lesson.day);
            return (
              <Link
                key={lesson.day}
                to={`/lesson/${lesson.day}`}
                className="flex items-center gap-3 p-3 bg-bg-card rounded-xl hover:bg-bg-hover transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {lesson.day}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{lesson.title}</p>
                  <p className="text-xs text-text-muted">
                    {lesson.generatedAt
                      ? new Date(lesson.generatedAt).toLocaleDateString('ko-KR')
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {progress?.quizScore !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        progress.quizScore >= 70
                          ? 'bg-success/20 text-success'
                          : progress.quizScore >= 40
                          ? 'bg-warning/20 text-warning'
                          : 'bg-error/20 text-error'
                      }`}
                    >
                      {progress.quizScore}점
                    </span>
                  )}
                  {progress && (
                    <span className="text-success text-sm">✓</span>
                  )}
                  <span className="text-text-muted text-xs">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
