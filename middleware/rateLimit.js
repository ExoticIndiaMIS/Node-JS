import { setTimeout as delay } from 'timers/promises';

const buckets = new Map();

export default function rateLimit({ windowMs = 15 * 60 * 1000, max = 10, keyGenerator } = {}) {
  return async function (req, res, next) {
    try {
      const key = (keyGenerator ? keyGenerator(req) : req.ip) || 'unknown';
      let bucket = buckets.get(key);
      const now = Date.now();
      if (!bucket || now - bucket.start >= windowMs) {
        bucket = { start: now, count: 0 };
        buckets.set(key, bucket);
      }
      bucket.count += 1;
      if (bucket.count > max) {
        res.set('Retry-After', Math.ceil((bucket.start + windowMs - now) / 1000));
        return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
      }
      return next();
    } catch (e) {
      return next();
    }
  };
}
