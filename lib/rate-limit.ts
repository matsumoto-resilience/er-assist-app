// プロセス内メモリによる簡易レート制限。
// NOTE: 単一インスタンス運用(ローカル・単一サーバー)を前提とした実装。
// サーバーレス環境(Vercel等)で複数インスタンスに水平分散される場合、
// インスタンスごとにカウンタが独立してしまうため、Upstash Redis等の
// 共有ストアを使った実装に置き換えること。

const WINDOW_MS = 60_000; // 1分間の時間窓
const MAX_REQUESTS_PER_WINDOW = 10; // 1分あたりの最大リクエスト数(IPごと)
const MAX_TRACKED_KEYS = 5000; // メモリ肥大化防止のための上限

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, bucket] of buckets) {
      if (now >= bucket.resetAt) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

// リバースプロキシ(Vercel等)経由の場合も考慮してクライアントIPを取得する
export function getClientKey(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
