import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  generateQuiz,
  gradeQuiz,
  QuizSet,
  GradeResult,
} from '../services/api';
import { useStudyProgress } from '../hooks/useStudyProgress';
import { useLocalStorage } from '../hooks/useLocalStorage';
import QuizCard from '../components/QuizCard';

export default function Quiz() {
  const { day } = useParams<{ day: string }>();
  const dayNum = parseInt(day || '1');

  const [quiz, setQuiz] = useState<QuizSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState('');

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useLocalStorage<GradeResult[] | null>(
    `quiz-results-${dayNum}`,
    null
  );

  const { markCompleted } = useStudyProgress();

  useEffect(() => {
    setLoading(true);
    setError('');
    setQuiz(null);
    setAnswers({});

    generateQuiz(dayNum)
      .then(setQuiz)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dayNum]);

  const allAnswered = quiz
    ? quiz.questions.every((q) => answers[q.id]?.trim())
    : false;

  const handleGrade = async () => {
    if (!quiz || !allAnswered) return;
    setGrading(true);
    try {
      const answerList = quiz.questions.map((q) => ({
        questionId: q.id,
        korean: q.korean,
        answer: answers[q.id],
      }));
      const response = await gradeQuiz(dayNum, answerList);
      setResults(response.results);

      const avgScore = Math.round(
        response.results.reduce((s, r) => s + r.score, 0) / response.results.length
      );
      markCompleted(dayNum, avgScore);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-text-muted text-sm">퀴즈 생성 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 text-center">
          <div className="text-error font-medium mb-2">오류</div>
          <div className="text-sm text-text-muted mb-4">{error}</div>
          <Link to={`/lesson/${dayNum}`} className="text-primary text-sm hover:underline">
            레슨으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const avgScore = results
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : null;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/lesson/${dayNum}`}
            className="text-sm text-text-muted hover:text-text transition-colors"
          >
            ← Day {dayNum} 레슨
          </Link>
          <h2 className="text-lg font-bold mt-1">작문 퀴즈</h2>
          <p className="text-sm text-text-muted">{quiz.grammar}</p>
        </div>
        {avgScore !== null && (
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{avgScore}</div>
            <div className="text-xs text-text-muted">평균 점수</div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((q) => (
          <QuizCard
            key={q.id}
            question={q}
            result={results?.find((r) => r.questionId === q.id)}
            answer={answers[q.id] || ''}
            onAnswerChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
            disabled={grading || !!results}
          />
        ))}
      </div>

      {/* Grade Button */}
      {!results && (
        <button
          onClick={handleGrade}
          disabled={!allAnswered || grading}
          className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {grading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              채점 중...
            </span>
          ) : (
            '전체 채점하기'
          )}
        </button>
      )}

      {/* Back to Lesson */}
      {results && (
        <div className="flex gap-3">
          <Link
            to={`/lesson/${dayNum}`}
            className="flex-1 py-3 rounded-xl bg-bg-card border border-border text-center text-sm font-medium hover:bg-bg-hover transition-colors"
          >
            레슨으로 돌아가기
          </Link>
          <button
            onClick={() => {
              setResults(null);
              setAnswers({});
            }}
            className="flex-1 py-3 rounded-xl bg-primary/10 text-primary text-center text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            다시 풀기
          </button>
        </div>
      )}
    </div>
  );
}
