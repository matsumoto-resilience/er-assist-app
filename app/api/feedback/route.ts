import { NextRequest, NextResponse } from "next/server";
import { appendFeedbackLog } from "@/lib/feedback-log";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 5_000;
const MAX_COMMENT_LENGTH = 1000;
const VALID_RATINGS = new Set(["helpful", "not_helpful"]);

export async function POST(req: NextRequest) {
  const rateLimitResult = checkRateLimit(`feedback:${getClientKey(req.headers)}`);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらく待ってから再試行してください。" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimitResult.retryAfterSeconds ?? 60) },
      }
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "リクエストのサイズが大きすぎます。" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストボディの形式が不正です。" }, { status: 400 });
  }

  const candidate = body as {
    auditId?: unknown;
    rating?: unknown;
    comment?: unknown;
  };

  if (typeof candidate.auditId !== "string" || candidate.auditId.length === 0) {
    return NextResponse.json({ error: "auditIdが不正です。" }, { status: 400 });
  }
  if (typeof candidate.rating !== "string" || !VALID_RATINGS.has(candidate.rating)) {
    return NextResponse.json({ error: "ratingが不正です。" }, { status: 400 });
  }
  if (candidate.comment != null && typeof candidate.comment !== "string") {
    return NextResponse.json({ error: "commentの形式が不正です。" }, { status: 400 });
  }
  if (typeof candidate.comment === "string" && candidate.comment.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json(
      { error: `コメントは${MAX_COMMENT_LENGTH}文字以内で入力してください。` },
      { status: 400 }
    );
  }

  await appendFeedbackLog({
    auditId: candidate.auditId,
    rating: candidate.rating as "helpful" | "not_helpful",
    comment: candidate.comment?.trim() || null,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
