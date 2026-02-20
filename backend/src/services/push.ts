import webPush from 'web-push';
import fs from 'fs';
import path from 'path';

const SUBSCRIPTIONS_PATH = path.join(__dirname, '../../data/subscriptions.json');

export function initWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (
    publicKey && privateKey && subject &&
    !publicKey.startsWith('your_') &&
    !privateKey.startsWith('your_')
  ) {
    try {
      webPush.setVapidDetails(subject, publicKey, privateKey);
      console.log('Web Push configured');
    } catch (err) {
      console.warn('Web Push configuration failed (invalid VAPID keys):', (err as Error).message);
    }
  } else {
    console.warn('VAPID keys not configured - push notifications disabled');
  }
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

function loadSubscriptions(): PushSubscription[] {
  if (fs.existsSync(SUBSCRIPTIONS_PATH)) {
    return JSON.parse(fs.readFileSync(SUBSCRIPTIONS_PATH, 'utf-8'));
  }
  return [];
}

function saveSubscriptions(subs: PushSubscription[]): void {
  const dir = path.dirname(SUBSCRIPTIONS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(SUBSCRIPTIONS_PATH, JSON.stringify(subs, null, 2), 'utf-8');
}

export function addSubscription(sub: PushSubscription): void {
  const subs = loadSubscriptions();
  const exists = subs.some((s) => s.endpoint === sub.endpoint);
  if (!exists) {
    subs.push(sub);
    saveSubscriptions(subs);
  }
}

export function removeSubscription(endpoint: string): void {
  const subs = loadSubscriptions().filter((s) => s.endpoint !== endpoint);
  saveSubscriptions(subs);
}

export async function sendPushToAll(payload: { title: string; body: string; url?: string }) {
  const subs = loadSubscriptions();
  const failed: string[] = [];

  for (const sub of subs) {
    try {
      await webPush.sendNotification(sub, JSON.stringify(payload));
    } catch (err: any) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        failed.push(sub.endpoint);
      }
      console.error(`Push failed for ${sub.endpoint}:`, err.message);
    }
  }

  if (failed.length > 0) {
    const remaining = subs.filter((s) => !failed.includes(s.endpoint));
    saveSubscriptions(remaining);
  }

  return { sent: subs.length - failed.length, failed: failed.length };
}
