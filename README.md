# nihongo-study

JLPT N3~N4 문법을 60일간 학습할 수 있는 개인용 PWA 앱. 매일 아침 Gemini AI가 문법 설명, 예문, 어휘를 생성하고 푸시 알림으로 알려줍니다.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 (PWA)
- **Backend**: Express + TypeScript + node-cron + web-push
- **AI**: Google Gemini Flash (문법 설명/퀴즈 생성/채점)
- **Deploy**: Fly.io (Docker)

## Features

- 60일 커리큘럼 기반 매일 자동 레슨 생성
- 문법 설명 + 예문(일/한) + 관련 어휘
- 작문 퀴즈 (한국어 → 일본어, AI 채점)
- 푸시 알림 (매일 아침 학습 알림)
- 아카이브 (지난 학습 복습)
- 다크/라이트 테마
- 오프라인 지원 (Service Worker 캐싱)

## Project Structure

```
nihongo-study/
├── frontend/
│   ├── src/
│   │   ├── components/    # Layout, GrammarView, QuizCard 등
│   │   ├── pages/         # Home, Lesson, Quiz, Archive, Settings
│   │   ├── hooks/         # useStudyProgress, useTheme 등
│   │   ├── services/      # API 클라이언트, 푸시 구독
│   │   └── sw.ts          # Service Worker (push + 캐싱)
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── routes/        # lesson, quiz, push API
│   │   ├── services/      # Gemini AI, curriculum 파서, web-push
│   │   └── cron/          # 매일 9시 레슨 생성 크론잡
│   └── data/
│       ├── curriculum.md  # 60일 커리큘럼
│       └── generated/     # 생성된 레슨 JSON 캐시
├── Dockerfile
└── fly.toml
```

## Setup

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp backend/.env.example backend/.env
# GEMINI_API_KEY, VAPID keys 등 설정

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## Environment Variables

| 변수 | 설명 |
|------|------|
| `GEMINI_API_KEY` | Google Gemini API 키 |
| `GEMINI_MODEL` | Gemini 모델명 (기본: gemini-2.5-flash) |
| `VAPID_PUBLIC_KEY` | Web Push VAPID 공개키 |
| `VAPID_PRIVATE_KEY` | Web Push VAPID 비공개키 |
| `VAPID_SUBJECT` | VAPID subject (mailto: URL) |
| `PORT` | 서버 포트 (기본: 3001) |
