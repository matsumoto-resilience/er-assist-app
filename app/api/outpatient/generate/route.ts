import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { retrieveRelevantEntries } from "@/lib/knowledge-base/retrieve";
import { appendAuditLog } from "@/lib/audit-log";
import { OUTPUT_JSON_SCHEMA, buildUserMessage } from "@/lib/prompt";
import { OUTPATIENT_SYSTEM_PROMPT } from "@/lib/outpatient/prompt";
import {
  GenerationRefusedError,
  getActiveProviderId,
  getGenerateFn,
} from "@/lib/providers";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { validatePatientInput } from "@/lib/validate";
import type { AssistOutput, PatientInput } from "@/lib/types";

const MAX_BODY_BYTES = 20_000;
const AUDIT_LOG_FILE = "audit-log-outpatient.jsonl";

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  const rateLimitResult = checkRateLimit(`outpatient:${getClientKey(req.headers)}`);
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

  let input: PatientInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストボディの形式が不正です。" },
      { status: 400 }
    );
  }

  const validationError = validatePatientInput(input);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const kbEntries = retrieveRelevantEntries(
    input.chiefComplaint,
    input.freeText ?? ""
  );

  const auditId = randomUUID();
  const providerId = getActiveProviderId();

  try {
    const generate = getGenerateFn();
    const { output: rawOutput, modelId } = await generate({
      systemPrompt: OUTPATIENT_SYSTEM_PROMPT,
      outputSchema: OUTPUT_JSON_SCHEMA,
      userMessage: buildUserMessage(input, kbEntries),
    });
    const output = rawOutput as AssistOutput;

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

    return NextResponse.json({
      output,
      auditId,
      provider: providerId,
      knowledgeBase: kbEntries,
    });
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
