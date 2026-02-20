import { useEffect, useState } from 'react';
import {
  getSchedule,
  updateSchedule as updateScheduleApi,
} from '../services/api';
import {
  requestPushSubscription,
  unsubscribeFromPush,
  isPushSubscribed,
} from '../services/pushNotification';
import { useTheme } from '../hooks/useTheme';

export default function Settings() {
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const { theme, toggle } = useTheme();

  const [scheduleHour, setScheduleHour] = useState(9);
  const [scheduleMinute, setScheduleMinute] = useState(0);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  useEffect(() => {
    isPushSubscribed().then(setPushEnabled);
    getSchedule()
      .then((s) => {
        setScheduleHour(s.hour);
        setScheduleMinute(s.minute);
      })
      .catch(() => {});
  }, []);

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
      } else {
        const success = await requestPushSubscription();
        setPushEnabled(success);
      }
    } catch (err) {
      console.error('Push toggle error:', err);
    } finally {
      setPushLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    try {
      await updateScheduleApi(scheduleHour, scheduleMinute);
      setScheduleSaved(true);
      setTimeout(() => setScheduleSaved(false), 2000);
    } catch (err) {
      console.error('Schedule update error:', err);
    }
  };

  const handleClearData = () => {
    if (confirm('학습 진행 데이터를 모두 삭제하시겠습니까?')) {
      const keys = Object.keys(localStorage).filter(
        (k) => k.startsWith('study-progress') || k.startsWith('quiz-results')
      );
      keys.forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h2 className="text-lg font-bold">설정</h2>

      {/* Theme */}
      <div className="bg-bg-card rounded-xl p-4 space-y-3">
        <h3 className="font-medium">테마</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">{theme === 'dark' ? '다크 모드' : '라이트 모드'}</p>
            <p className="text-xs text-text-muted">화면 밝기를 전환합니다</p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              theme === 'light' ? 'bg-primary' : 'bg-border'
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                theme === 'light' ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Schedule */}
      <div className="bg-bg-card rounded-xl p-4 space-y-3">
        <h3 className="font-medium">알림 설정</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">푸시 알림</p>
            <p className="text-xs text-text-muted">새 레슨 알림을 받습니다</p>
          </div>
          <button
            onClick={handleTogglePush}
            disabled={pushLoading}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              pushEnabled ? 'bg-primary' : 'bg-border'
            } ${pushLoading ? 'opacity-50' : ''}`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                pushEnabled ? 'translate-x-5.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        <div>
          <p className="text-sm mb-2">알림 시간</p>
          <div className="flex items-center gap-2">
            <select
              value={scheduleHour}
              onChange={(e) => setScheduleHour(Number(e.target.value))}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>
                  {String(i).padStart(2, '0')}시
                </option>
              ))}
            </select>
            <select
              value={scheduleMinute}
              onChange={(e) => setScheduleMinute(Number(e.target.value))}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              {[0, 10, 20, 30, 40, 50].map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}분
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateSchedule}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                scheduleSaved
                  ? 'bg-success/20 text-success'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {scheduleSaved ? '저장됨' : '저장'}
            </button>
          </div>
          <p className="text-xs text-text-muted mt-1">한국 시간(KST) 기준</p>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-bg-card rounded-xl p-4 space-y-3">
        <h3 className="font-medium">데이터 관리</h3>
        <button
          onClick={handleClearData}
          className="w-full py-2 rounded-lg bg-error/10 text-error text-sm font-medium hover:bg-error/20 transition-colors"
        >
          학습 데이터 초기화
        </button>
        <p className="text-xs text-text-muted">
          로컬 학습 진행도와 퀴즈 결과가 삭제됩니다. 서버의 레슨 데이터는 유지됩니다.
        </p>
      </div>

      {/* App Info */}
      <div className="bg-bg-card rounded-xl p-4 space-y-2">
        <h3 className="font-medium">앱 정보</h3>
        <div className="text-sm text-text-muted space-y-1">
          <p>日本語 Study v1.0.0</p>
          <p>JLPT N3~N4 문법 학습 PWA</p>
          <p>AI: Google Gemini Flash</p>
        </div>
      </div>
    </div>
  );
}
