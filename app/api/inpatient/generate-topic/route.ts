import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { appendAuditLog } from "@/lib/audit-log";
import {
  INPATIENT_TOPIC_OUTPUT_JSON_SCHEMA,
  INPATIENT_TOPIC_SYSTEM_PROMPT,
  buildInpatientTopicUserMessage,
} from "@/lib/inpatient/topic-prompt";
import {
  GenerationRefusedError,
  getActiveProviderId,
  getGenerateFn,
} from "@/lib/providers";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { requireUser } from "@/lib/require-auth";
import { validateInpatientTopicInput } from "@/lib/inpatient/topic-validate";
import type { InpatientAiTopicResult } from "@/lib/inpatient/types";

const MAX_BODY_BYTES = 2_000;
const AUDIT_LOG_FILE = "audit-log-inpatient-topic.jsonl";

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  const unauthorized = await requireUser();
  if (unauthorized) return unauthorized;

  const rateLimitResult = checkRateLimit(`inpatient-topic:${getClientKey(req.headers)}`);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらく待ってから再試行してください。" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfterSeconds ?? 60),
        },
      }
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "リクエストのサイズが大きすぎます。" },
      { status: 413 }
    );
  }

  let input: { topic: string };
  try {
    input = await req.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストボディの形式が不正です。" },
      { status: 400 }
    );
  }

  const validationError = validateInpatientTopicInput(input);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const auditId = randomUUID();
  const providerId = getActiveProviderId();

  try {
    const generate = getGenerateFn();
    const { output: rawOutput, modelId } = await generate({
      systemPrompt: INPATIENT_TOPIC_SYSTEM_PROMPT,
      outputSchema: INPATIENT_TOPIC_OUTPUT_JSON_SCHEMA,
      userMessage: buildInpatientTopicUserMessage(input.topic),
    });
    const output = { topic: input.topic, ...(rawOutput as object) } as InpatientAiTopicResult;

    await appendAuditLog(
      {
        id: auditId,
        timestamp: new Date().toISOString(),
        provider: providerId,
        modelId,
        input,
        output,
        error: null,
        latencyMs: Date.now() - startedAt,
      },
      AUDIT_LOG_FILE
    );

    return NextResponse.json({ output, auditId, provider: providerId });
  } catch (err) {
    if (err instanceof GenerationRefusedError) {
      await appendAuditLog(
        {
          id: auditId,
          timestamp: new Date().toISOString(),
          provider: providerId,
          modelId: providerId,
          input,
          output: null,
          error: "refusal",
          latencyMs: Date.now() - startedAt,
        },
        AUDIT_LOG_FILE
      );
      return NextResponse.json(
        { error: "AIが安全性の観点からこの内容の生成を見送りました。" },
        { status: 422 }
      );
    }

    const message = err instanceof Error ? err.message : "不明なエラー";
    await appendAuditLog(
      {
        id: auditId,
        timestamp: new Date().toISOString(),
        provider: providerId,
        modelId: providerId,
        input,
        output: null,
        error: message,
        latencyMs: Date.now() - startedAt,
      },
      AUDIT_LOG_FILE
    );
    return NextResponse.json(
      { error: `生成中にエラーが発生しました: ${message}` },
      { status: 500 }
    );
  }
}
