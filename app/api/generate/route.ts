import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { retrieveRelevantEntries } from "@/lib/knowledge-base/retrieve";
import { appendAuditLog } from "@/lib/audit-log";
import {
  GenerationRefusedError,
  getActiveProviderId,
  getGenerateFn,
} from "@/lib/providers";
import type { PatientInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  let input: PatientInput;

  try {
    input = await req.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストボディの形式が不正です。" },
      { status: 400 }
    );
  }

  if (!input.chiefComplaint || input.chiefComplaint.trim() === "") {
    return NextResponse.json(
      { error: "主訴を入力してください。" },
      { status: 400 }
    );
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

    return NextResponse.json({ output, auditId, provider: providerId });
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
