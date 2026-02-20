import Markdown from 'react-markdown';
import { LessonData } from '../services/api';
import CopyButton from './CopyButton';

interface GrammarViewProps {
  lesson: LessonData;
}

function formatLessonAsMarkdown(lesson: LessonData): string {
  let md = `# Day ${lesson.day}: ${lesson.title}\n\n`;
  md += `## 문법 설명\n${lesson.explanation}\n\n`;
  md += `## 예문\n`;
  for (const ex of lesson.examples) {
    md += `- **${ex.japanese}** (${ex.reading})\n  → ${ex.korean}\n`;
  }
  md += `\n## 어휘\n`;
  for (const v of lesson.vocabulary) {
    md += `- **${v.word}** (${v.reading}) — ${v.meaning}\n`;
  }
  return md;
}

export default function GrammarView({ lesson }: GrammarViewProps) {
  const fullMarkdown = formatLessonAsMarkdown(lesson);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-primary font-medium mb-1">Day {lesson.day}</div>
          <h2 className="text-xl font-bold">{lesson.title}</h2>
        </div>
        <CopyButton text={fullMarkdown} label="전체 복사" />
      </div>

      {/* Explanation */}
      <section className="bg-bg-card rounded-xl p-4">
        <h3 className="text-sm font-medium text-primary mb-3">문법 설명</h3>
        <div className="text-sm leading-relaxed [&_strong]:text-text [&_strong]:font-bold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-1 [&_p]:my-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_code]:bg-bg-hover [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary">
          <Markdown>{lesson.explanation}</Markdown>
        </div>
      </section>

      {/* Examples */}
      <section className="bg-bg-card rounded-xl p-4">
        <h3 className="text-sm font-medium text-primary mb-3">예문</h3>
        <div className="space-y-3">
          {lesson.examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => navigator.clipboard.writeText(`${ex.japanese}\n${ex.reading}\n${ex.korean}`)}
              className="w-full text-left p-3 rounded-lg bg-bg/50 hover:bg-bg-hover transition-colors active:scale-[0.99]"
            >
              <p className="font-medium text-base">{ex.japanese}</p>
              <p className="text-text-muted text-sm mt-0.5">{ex.reading}</p>
              <p className="text-sm mt-1 text-text-muted">→ {ex.korean}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Vocabulary */}
      <section className="bg-bg-card rounded-xl p-4">
        <h3 className="text-sm font-medium text-primary mb-3">어휘</h3>
        <div className="grid gap-2">
          {lesson.vocabulary.map((v, i) => (
            <button
              key={i}
              onClick={() => navigator.clipboard.writeText(`${v.word} (${v.reading}) — ${v.meaning}`)}
              className="flex items-baseline gap-2 p-2 rounded-lg hover:bg-bg-hover transition-colors text-left"
            >
              <span className="font-medium">{v.word}</span>
              <span className="text-text-muted text-sm">{v.reading}</span>
              <span className="text-text-muted text-sm ml-auto">{v.meaning}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
