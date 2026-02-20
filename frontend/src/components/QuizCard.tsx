import { QuizQuestion, GradeResult } from '../services/api';

interface QuizCardProps {
  question: QuizQuestion;
  result?: GradeResult;
  answer: string;
  onAnswerChange: (answer: string) => void;
  disabled?: boolean;
}

export default function QuizCard({ question, result, answer, onAnswerChange, disabled }: QuizCardProps) {
  return (
    <div className="bg-bg-card rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
          Q{question.id}
        </span>
        {result && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              result.isCorrect
                ? 'bg-success/20 text-success'
                : 'bg-error/20 text-error'
            }`}
          >
            {result.score}/100
          </span>
        )}
      </div>

      <p className="font-medium">{question.korean}</p>
      <p className="text-sm text-text-muted">힌트: {question.hint}</p>

      {!result ? (
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="일본어로 작문하세요..."
          disabled={disabled}
          className="w-full bg-bg border border-border rounded-lg p-3 text-sm resize-none h-20 focus:outline-none focus:border-primary placeholder:text-text-muted/50"
        />
      ) : (
        <div className="space-y-2 text-sm">
          <div className="p-3 rounded-lg bg-bg/50">
            <p className="text-text-muted mb-1">내 답:</p>
            <p>{result.userAnswer}</p>
          </div>
          <div className="p-3 rounded-lg bg-bg/50">
            <p className="text-text-muted mb-1">모범 답안:</p>
            <p className="font-medium">{result.modelAnswer}</p>
          </div>
          <div className="p-3 rounded-lg bg-bg/50">
            <p className="text-text-muted mb-1">피드백:</p>
            <p>{result.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
