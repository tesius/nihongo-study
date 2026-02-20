import { GoogleGenerativeAI } from '@google/generative-ai';
import { DayTopic, GeneratedLesson } from './curriculum';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function getModel() {
  return genAI.getGenerativeModel({ model: MODEL });
}

export async function generateLesson(topic: DayTopic): Promise<GeneratedLesson> {
  const model = getModel();

  const prompt = `당신은 JLPT N3~N4 수준의 일본어 문법을 가르치는 전문 튜터입니다.

다음 문법 항목에 대해 한국어로 설명해주세요:

**Day ${topic.day}: ${topic.title}**
${topic.description ? `설명: ${topic.description}` : ''}

다음 JSON 형식으로 정확히 응답해주세요 (JSON만 출력, 다른 텍스트 없이):

{
  "explanation": "문법 패턴 설명 (접속 방법, 의미, 뉘앙스, 주의점을 포함한 상세 설명. 마크다운 형식 사용 가능)",
  "examples": [
    {
      "japanese": "예문 (한자 포함)",
      "reading": "예문 (히라가나 읽기)",
      "korean": "한국어 번역"
    }
  ],
  "vocabulary": [
    {
      "word": "단어 (한자)",
      "reading": "히라가나 읽기",
      "meaning": "한국어 뜻"
    }
  ]
}

요구사항:
- explanation: 문법의 접속 방법, 의미, 사용 상황, 주의점을 상세히 설명 (300자 이상)
- examples: 4~5개의 자연스러운 예문 (일상 대화, JLPT 출제 스타일 포함)
- vocabulary: 예문에 사용된 주요 단어 + 관련 어휘 총 7~10개`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Gemini response as JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    day: topic.day,
    title: topic.title,
    grammar: topic.grammar,
    explanation: parsed.explanation,
    examples: parsed.examples,
    vocabulary: parsed.vocabulary,
    generatedAt: new Date().toISOString(),
  };
}

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

export async function generateQuiz(lesson: GeneratedLesson): Promise<QuizSet> {
  const model = getModel();

  const prompt = `당신은 JLPT N3~N4 일본어 작문 퀴즈 출제자입니다.

Day ${lesson.day}에서 배운 문법: ${lesson.title}
문법 설명: ${lesson.explanation}

이 문법을 사용하여 작문 퀴즈 3문제를 만들어주세요.

다음 JSON 형식으로 정확히 응답해주세요 (JSON만 출력):

{
  "questions": [
    {
      "id": 1,
      "korean": "한국어 문장 (이것을 일본어로 작문해야 함)",
      "hint": "힌트 (사용해야 할 핵심 표현이나 단어)"
    }
  ]
}

요구사항:
- 3문제 출제
- 난이도: 쉬움 → 보통 → 어려움 순서
- 해당 Day의 문법 패턴을 반드시 사용해야 하는 문장
- 힌트는 핵심 동사나 표현을 제공`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse quiz response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    day: lesson.day,
    grammar: lesson.grammar,
    questions: parsed.questions,
  };
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

export async function gradeQuiz(
  lesson: GeneratedLesson,
  answers: Array<{ questionId: number; korean: string; answer: string }>
): Promise<GradeResult[]> {
  const model = getModel();

  const prompt = `당신은 JLPT N3~N4 일본어 작문 채점자입니다.

Day ${lesson.day} 문법: ${lesson.title}

학생의 답안을 채점해주세요:

${answers.map((a) => `문제 ${a.questionId}: "${a.korean}" → 학생 답: "${a.answer}"`).join('\n')}

다음 JSON 형식으로 정확히 응답해주세요 (JSON만 출력):

{
  "results": [
    {
      "questionId": 1,
      "isCorrect": true/false,
      "score": 0~100,
      "correction": "틀린 부분 교정 (맞으면 빈 문자열)",
      "modelAnswer": "모범 답안",
      "feedback": "구체적인 피드백 (잘한 점, 개선점)"
    }
  ]
}

채점 기준:
- 문법 패턴의 올바른 사용 (40%)
- 조사/활용의 정확성 (30%)
- 자연스러운 표현 (20%)
- 한자/어휘 사용 (10%)
- 의미가 통하고 문법이 맞으면 모범답안과 달라도 높은 점수`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse grading response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return parsed.results.map((r: any, i: number) => ({
    ...r,
    korean: answers[i]?.korean || '',
    userAnswer: answers[i]?.answer || '',
  }));
}
