import { Router, type Router as RouterType } from 'express';
import { addSubscription, removeSubscription } from '../services/push';

const router: RouterType = Router();

// POST /api/push/subscribe - Register push subscription
router.post('/subscribe', (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription?.endpoint || !subscription?.keys) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    addSubscription(subscription);
    res.json({ message: 'Subscribed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/push/unsubscribe - Remove push subscription
router.post('/unsubscribe', (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: 'endpoint is required' });
    }

    removeSubscription(endpoint);
    res.json({ message: 'Unsubscribed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/push/vapid-key - Get VAPID public key
router.get('/vapid-key', (_req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key || key === 'your_vapid_public_key_here') {
    return res.status(404).json({ error: 'VAPID key not configured' });
  }
  res.json({ publicKey: key });
});

export default router;
