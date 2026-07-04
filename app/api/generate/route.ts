import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { retrieveRelevantEntries } from "@/lib/knowledge-base/retrieve";
import { appendAuditLog } from "@/lib/audit-log";
import {
  GenerationRefusedError,
  getActiveProviderId,
  getGenerateFn,
} from "@/lib/providers";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";
import { validatePatientInput } from "@/lib/validate";
import type { PatientInput } from "@/lib/types";

const MAX_BODY_BYTES = 20_000; // フォーム入力を大きく超える異常なペイロードを弾く

export async function POST(req: NextRequest) {
  const startedAt = Date.now();

  // レート制限(APIコスト濫用・DoS対策)
  const clientKey = getClientKey(req.headers);
  const rateLimitResult = checkRateLimit(clientKey);
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

  // リクエストサイズ上限チェック
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
    const { output, modelId } = await generate(input, kbEntries);

    await appendAuditLog({
      id: auditId,
      timestamp: new Date().toISOString(),
      provider: providerId,
      modelId,
      input,
      output,
      error: null,
      latencyMs: Date.now() - startedAt,
    });

    return NextResponse.json({
      output,
      auditId,
      provider: providerId,
      knowledgeBase: kbEntries,
    });
  } catch (err) {
    if (err instanceof GenerationRefusedError) {
      await appendAuditLog({
        id: auditId,
        timestamp: new Date().toISOString(),
        provider: providerId,
        modelId: providerId,
        input,
        output: null,
        error: "refusal",
        latencyMs: Date.now() - startedAt,
      });
      return NextResponse.json(
        { error: "AIが安全性の観点からこの内容の生成を見送りました。" },
        { status: 422 }
      );
    }

    const message = err instanceof Error ? err.message : "不明なエラー";
    await appendAuditLog({
      id: auditId,
      timestamp: new Date().toISOString(),
      provider: providerId,
      modelId: providerId,
      input,
      output: null,
      error: message,
      latencyMs: Date.now() - startedAt,
    });
    return NextResponse.json(
      { error: `生成中にエラーが発生しました: ${message}` },
      { status: 500 }
    );
  }
}
