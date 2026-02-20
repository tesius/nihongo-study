import cron, { ScheduledTask } from 'node-cron';
import fs from 'fs';
import path from 'path';
import { getDayTopic, getCachedLesson, saveLesson, getGeneratedDays } from '../services/curriculum';
import { generateLesson } from '../services/gemini';
import { sendPushToAll } from '../services/push';

const SETTINGS_PATH = path.join(__dirname, '../../data/settings.json');

interface CronSettings {
  hour: number;
  minute: number;
  timezone: string;
}

let currentTask: ScheduledTask | null = null;

function loadSettings(): CronSettings {
  if (fs.existsSync(SETTINGS_PATH)) {
    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
  }
  return { hour: 9, minute: 0, timezone: 'Asia/Seoul' };
}

function saveSettings(settings: CronSettings): void {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
}

function scheduleCron(settings: CronSettings) {
  if (currentTask) {
    currentTask.stop();
  }

  const expression = `${settings.minute} ${settings.hour} * * *`;
  currentTask = cron.schedule(expression, async () => {
    console.log('[CRON] Daily lesson generation triggered');
    await generateDailyLesson();
  }, { timezone: settings.timezone });

  const timeStr = `${String(settings.hour).padStart(2, '0')}:${String(settings.minute).padStart(2, '0')}`;
  console.log(`Daily cron job scheduled (${timeStr} ${settings.timezone})`);
}

export function startDailyCron() {
  const settings = loadSettings();
  scheduleCron(settings);
}

export function getSchedule(): CronSettings {
  return loadSettings();
}

export function updateSchedule(hour: number, minute: number): CronSettings {
  const settings = loadSettings();
  settings.hour = hour;
  settings.minute = minute;
  saveSettings(settings);
  scheduleCron(settings);
  return settings;
}

export async function generateDailyLesson() {
  try {
    const generatedDays = getGeneratedDays();
    const nextDay = generatedDays.length > 0 ? Math.max(...generatedDays) + 1 : 1;

    const topic = getDayTopic(nextDay);
    if (!topic) {
      console.log(`[CRON] No topic found for Day ${nextDay} - curriculum complete!`);
      return null;
    }

    // Check if already generated
    const cached = getCachedLesson(nextDay);
    if (cached) {
      console.log(`[CRON] Day ${nextDay} already generated, skipping`);
      return cached;
    }

    console.log(`[CRON] Generating lesson for Day ${nextDay}: ${topic.title}`);
    const lesson = await generateLesson(topic);
    saveLesson(lesson);
    console.log(`[CRON] Day ${nextDay} lesson saved`);

    // Send push notification
    try {
      const result = await sendPushToAll({
        title: `Day ${nextDay} 학습 준비 완료!`,
        body: `${topic.title}`,
        url: `/lesson/${nextDay}`,
      });
      console.log(`[CRON] Push sent: ${result.sent} success, ${result.failed} failed`);
    } catch (err) {
      console.error('[CRON] Push notification failed:', err);
    }

    return lesson;
  } catch (err) {
    console.error('[CRON] Daily lesson generation failed:', err);
    return null;
  }
}
