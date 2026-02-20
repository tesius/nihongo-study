import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLessons, LessonsListResponse } from '../services/api';
import { useStudyProgress } from '../hooks/useStudyProgress';
import ProgressBar from '../components/ProgressBar';

export default function Home() {
  const [data, setData] = useState<LessonsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getTotalCompleted, getAverageScore } = useStudyProgress();

  useEffect(() => {
    fetchLessons()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const latestDay = data?.lessons?.length
    ? Math.max(...data.lessons.map((l) => l.day))
    : 0;

  const avgScore = getAverageScore();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-muted animate-pulse">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      {/* Today's Study CTA */}
      {latestDay > 0 ? (
        <Link
          to={`/lesson/${latestDay}`}
          className="block bg-primary/10 border border-primary/30 rounded-xl p-5 hover:bg-primary/15 transition-colors"
        >
          <div className="text-sm text-primary font-medium mb-1">오늘의 학습</div>
          <div className="text-lg font-bold mb-1">
            Day {latestDay}: {data?.lessons.find((l) => l.day === latestDay)?.title}
          </div>
          <div className="text-sm text-text-muted">탭하여 학습 시작 →</div>
        </Link>
      ) : (
        <div className="bg-bg-card rounded-xl p-5 text-center">
          <div className="text-2xl mb-2">📖</div>
          <div className="font-medium mb-1">아직 생성된 레슨이 없습니다</div>
          <div className="text-sm text-text-muted">
            매일 아침 9시에 새 레슨이 자동으로 생성됩니다
          </div>
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 text-sm text-error">
          {error}
        </div>
      )}

      {/* Progress */}
      <div className="bg-bg-card rounded-xl p-4 space-y-4">
        <h3 className="font-medium">학습 진행률</h3>
        <ProgressBar
          current={data?.completedDays || 0}
          total={data?.totalDays || 60}
          label="전체 커리큘럼"
        />
        <ProgressBar
          current={getTotalCompleted()}
          total={data?.completedDays || 0}
          label="학습 완료"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg-card rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-primary">{data?.completedDays || 0}</div>
          <div className="text-xs text-text-muted mt-1">생성된 레슨</div>
        </div>
        <div className="bg-bg-card rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-success">{getTotalCompleted()}</div>
          <div className="text-xs text-text-muted mt-1">학습 완료</div>
        </div>
        <div className="bg-bg-card rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-warning">{avgScore ?? '-'}</div>
          <div className="text-xs text-text-muted mt-1">평균 점수</div>
        </div>
      </div>

      {/* Recent Lessons */}
      {data && data.lessons.length > 0 && (
        <div className="bg-bg-card rounded-xl p-4">
          <h3 className="font-medium mb-3">최근 레슨</h3>
          <div className="space-y-2">
            {data.lessons
              .slice(-5)
              .reverse()
              .map((lesson) => (
                <Link
                  key={lesson.day}
                  to={`/lesson/${lesson.day}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-bg-hover transition-colors"
                >
                  <div>
                    <span className="text-sm text-primary font-medium mr-2">Day {lesson.day}</span>
                    <span className="text-sm">{lesson.title}</span>
                  </div>
                  <span className="text-text-muted text-xs">→</span>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
