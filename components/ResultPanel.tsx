"use client";

import { useState } from "react";
import type { AssistOutput, KnowledgeBaseEntry, PatientInput } from "@/lib/types";

const likelihoodStyles: Record<string, string> = {
  high: "bg-red-100 text-red-800 border-red-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  low: "bg-gray-100 text-gray-700 border-gray-300",
};

const likelihoodLabel: Record<string, string> = {
  high: "可能性: 高",
  medium: "可能性: 中",
  low: "可能性: 低",
};

function buildCaseReport(input: PatientInput, output: AssistOutput): string {
  const sexLabel =
    input.sex === "male" ? "男性" : input.sex === "female" ? "女性" : "不明";
  const v = input.vitals ?? {};
  const vitalsLines = [
    v.systolicBP != null || v.diastolicBP != null
      ? `血圧: ${v.systolicBP ?? "-"}/${v.diastolicBP ?? "-"} mmHg`
      : null,
    v.heartRate != null ? `心拍数: ${v.heartRate} /分` : null,
    v.respiratoryRate != null ? `呼吸数: ${v.respiratoryRate} /分` : null,
    v.spo2 != null ? `SpO2: ${v.spo2} %` : null,
    v.bodyTemp != null ? `体温: ${v.bodyTemp} ℃` : null,
    v.gcs != null ? `GCS: ${v.gcs}` : null,
  ].filter((line): line is string => line !== null);

  return `# ER Assist 症例記録
生成日時: ${new Date().toLocaleString("ja-JP")}

## 患者情報
主訴: ${input.chiefComplaint}
年齢: ${input.age != null ? `${input.age}歳` : "不明"}
性別: ${sexLabel}
バイタルサイン: ${vitalsLines.length > 0 ? vitalsLines.join(", ") : "未入力"}
確認したいポイント: ${input.focusQuestion?.trim() || "(指定なし)"}

現病歴・その他の情報:
${input.freeText || "(記載なし)"}

## 要点(直ちに行うべきこと)
${output.keyActions.map((p) => `- ${p}`).join("\n")}

## 要点(優先して確認すべき検査)
${output.keyWorkup.map((p) => `- ${p}`).join("\n")}

## 1. 診療方針
${output.assessmentPlan}

## 2. 鑑別疾患
${output.differentialDiagnosis
  .map(
    (dd) =>
      `- ${dd.name}(${likelihoodLabel[dd.likelihood] ?? dd.likelihood})\n  根拠: ${dd.rationale}`
  )
  .join("\n")}

## 身体所見チェックリスト
${output.physicalExamChecklist.map((item) => `- ${item}`).join("\n")}

## 3. 治療方針
初期対応: ${output.treatmentPlan.immediateActions.join(", ") || "-"}
必要な検査: ${output.treatmentPlan.workup.join(", ") || "-"}
想定される薬剤: ${output.treatmentPlan.medications.join(", ") || "-"}
収容先の考え方: ${output.treatmentPlan.disposition}
モニタリング項目: ${output.treatmentPlan.monitoring.join(", ") || "-"}

## Red Flag
${
  output.redFlagsIdentified.length > 0
    ? output.redFlagsIdentified
        .map((rf) => `- ${rf.finding}(示唆される疾患: ${rf.suspectedDiseases.join("、") || "-"})`)
        .join("\n")
    : "特になし"
}

## 確信度・補足事項
${output.confidenceNote}

---
本記録はAIによる参考情報であり、最終的な診断・治療方針は医師の責任において決定してください。
`;
}

function downloadCaseReport(input: PatientInput, output: AssistOutput) {
  const report = buildCaseReport(input, output);
  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const a = document.createElement("a");
  a.href = url;
  a.download = `er-assist_${input.chiefComplaint.slice(0, 20)}_${timestamp}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ResultPanel({
  output,
  input,
  knowledgeBase,
  auditId,
}: {
  output: AssistOutput;
  input: PatientInput;
  knowledgeBase: KnowledgeBaseEntry[];
  auditId: string | null;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => downloadCaseReport(input, output)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          この症例を保存(テキストファイル)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {output.keyActions.length > 0 && (
          <section className="rounded-md border-2 border-blue-300 bg-blue-50 p-4">
            <h3 className="text-sm font-bold text-blue-900">要点: 直ちに行うべきこと</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm font-medium text-blue-950">
              {output.keyActions.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </section>
        )}
        {output.keyWorkup.length > 0 && (
          <section className="rounded-md border-2 border-teal-300 bg-teal-50 p-4">
            <h3 className="text-sm font-bold text-teal-900">要点: 優先して確認すべき検査</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm font-medium text-teal-950">
              {output.keyWorkup.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {output.redFlagsIdentified.length > 0 && (
        <section className="rounded-md border border-red-300 bg-red-50 p-4">
          <h3 className="text-sm font-bold text-red-800">
            ⚠ 特定されたRed Flag
          </h3>
          <ul className="mt-2 space-y-2 text-sm text-red-900">
            {output.redFlagsIdentified.map((flag, i) => (
              <li key={i}>
                <span className="font-medium">{flag.finding}</span>
                {flag.suspectedDiseases.length > 0 && (
                  <span className="block text-xs text-red-700">
                    示唆される疾患: {flag.suspectedDiseases.join("、")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900">1. 診療方針</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
          {output.assessmentPlan}
        </p>
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900">2. 鑑別疾患</h3>
        <div className="mt-3 space-y-3">
          {output.differentialDiagnosis.map((dd, i) => (
            <div key={i} className="rounded-md border border-gray-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-900">{dd.name}</span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                    likelihoodStyles[dd.likelihood] ?? likelihoodStyles.low
                  }`}
                >
                  {likelihoodLabel[dd.likelihood] ?? dd.likelihood}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-700">{dd.rationale}</p>
            </div>
          ))}
        </div>

        {output.physicalExamChecklist.length > 0 && (
          <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
            <span className="text-xs font-medium text-gray-500">
              身体所見チェックリスト(上記鑑別疾患を横断して集約):
            </span>
            <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
              {output.physicalExamChecklist.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900">3. 治療方針</h3>
        <TreatmentFlow plan={output.treatmentPlan} />
      </section>

      <section className="rounded-md border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-bold text-blue-900">確信度・補足事項</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-blue-900">
          {output.confidenceNote}
        </p>
      </section>

      <GuidelineReferencePanel entries={knowledgeBase} />

      <CaseFeedback auditId={auditId} />
    </div>
  );
}

function TreatmentFlow({ plan }: { plan: AssistOutput["treatmentPlan"] }) {
  const stages: { title: string; items: string[]; text?: string }[] = [
    { title: "直ちに行うべき初期対応", items: plan.immediateActions },
    { title: "必要な検査", items: plan.workup },
    { title: "想定される薬剤", items: plan.medications },
    { title: "収容先の考え方", items: [], text: plan.disposition },
    { title: "モニタリング項目", items: plan.monitoring },
  ].filter((stage) => stage.items.length > 0 || stage.text);

  return (
    <div className="mt-3">
      {stages.map((stage, i) => (
        <div key={stage.title} className="relative flex gap-3 pb-5 last:pb-0">
          {i < stages.length - 1 && (
            <span
              aria-hidden
              className="absolute left-[15px] top-8 bottom-0 w-px bg-blue-200"
            />
          )}
          <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {i + 1}
          </span>
          <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <h4 className="text-xs font-bold text-gray-700">{stage.title}</h4>
            {stage.items.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-sm text-gray-800">
                {stage.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
            {stage.text && (
              <p className="mt-1 text-sm text-gray-800">{stage.text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function GuidelineReferencePanel({ entries }: { entries: KnowledgeBaseEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <section className="rounded-md border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-bold text-gray-900">
        参考: 主訴別の初期評価フローと文献
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        本ツールの知識ベースに登録済みの主訴のみ表示しています。網羅的なものではありません。
      </p>
      <div className="mt-3 space-y-4">
        {entries.map((entry) => (
          <div key={entry.category} className="rounded-md border border-gray-200 p-3">
            <span className="text-sm font-semibold text-gray-900">{entry.category}</span>
            {entry.flowchartSteps.length > 0 && (
              <ol className="mt-2 space-y-1">
                {entry.flowchartSteps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-800">
                    <span className="shrink-0 font-semibold text-gray-400">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
            {entry.references.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-gray-100 pt-2 text-xs text-gray-600">
                {entry.references.map((ref) => (
                  <li key={ref.url}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 underline hover:text-blue-900"
                    >
                      {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function CaseFeedback({ auditId }: { auditId: string | null }) {
  const [rating, setRating] = useState<"helpful" | "not_helpful" | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  if (!auditId) return null;

  async function submit() {
    if (!rating) return;
    setSending(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, rating, comment }),
      });
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <section className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        フィードバックありがとうございました。振り返りに活用させていただきます。
      </section>
    );
  }

  return (
    <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-bold text-gray-900">振り返り: この提案は参考になりましたか?</h3>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setRating("helpful")}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            rating === "helpful"
              ? "border-blue-400 bg-blue-100 text-blue-900"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          👍 参考になった
        </button>
        <button
          type="button"
          onClick={() => setRating("not_helpful")}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            rating === "not_helpful"
              ? "border-red-400 bg-red-100 text-red-900"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          👎 改善してほしい
        </button>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="コメント(任意): 良かった点・分かりにくかった点など"
        rows={2}
        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="button"
        disabled={!rating || sending}
        onClick={submit}
        className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        送信
      </button>
    </section>
  );
}
