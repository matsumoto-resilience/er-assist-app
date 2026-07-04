"use client";

import type { AssistOutput, PatientInput } from "@/lib/types";

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

## 要点
${output.keyPoints.map((p) => `- ${p}`).join("\n")}

## 1. 診療方針
${output.assessmentPlan}

## 2. 鑑別疾患
${output.differentialDiagnosis
  .map(
    (dd) =>
      `- ${dd.name}(${likelihoodLabel[dd.likelihood] ?? dd.likelihood})\n  根拠: ${dd.rationale}${
        dd.redFlagsToRuleOut.length > 0
          ? `\n  除外すべきRed Flag: ${dd.redFlagsToRuleOut.join(", ")}`
          : ""
      }`
  )
  .join("\n")}

## 3. 治療方針
初期対応: ${output.treatmentPlan.immediateActions.join(", ") || "-"}
必要な検査: ${output.treatmentPlan.workup.join(", ") || "-"}
想定される薬剤: ${output.treatmentPlan.medications.join(", ") || "-"}
収容先の考え方: ${output.treatmentPlan.disposition}
モニタリング項目: ${output.treatmentPlan.monitoring.join(", ") || "-"}

## Red Flag
${output.redFlagsIdentified.length > 0 ? output.redFlagsIdentified.join(", ") : "特になし"}

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
}: {
  output: AssistOutput;
  input: PatientInput;
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

      {output.keyPoints.length > 0 && (
        <section className="rounded-md border-2 border-blue-300 bg-blue-50 p-4">
          <h3 className="text-sm font-bold text-blue-900">要点</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm font-medium text-blue-950">
            {output.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {output.redFlagsIdentified.length > 0 && (
        <section className="rounded-md border border-red-300 bg-red-50 p-4">
          <h3 className="text-sm font-bold text-red-800">
            ⚠ 特定されたRed Flag
          </h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-900">
            {output.redFlagsIdentified.map((flag, i) => (
              <li key={i}>{flag}</li>
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
              {dd.redFlagsToRuleOut.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-gray-500">
                    除外すべきRed Flag:
                  </span>
                  <ul className="mt-1 list-inside list-disc text-xs text-gray-600">
                    {dd.redFlagsToRuleOut.map((rf, j) => (
                      <li key={j}>{rf}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900">3. 治療方針</h3>
        <div className="mt-3 space-y-3 text-sm text-gray-800">
          <PlanList title="直ちに行うべき初期対応" items={output.treatmentPlan.immediateActions} />
          <PlanList title="必要な検査" items={output.treatmentPlan.workup} />
          <PlanList title="想定される薬剤" items={output.treatmentPlan.medications} />
          <div>
            <span className="font-medium text-gray-700">収容先の考え方: </span>
            {output.treatmentPlan.disposition}
          </div>
          <PlanList title="モニタリング項目" items={output.treatmentPlan.monitoring} />
        </div>
      </section>

      <section className="rounded-md border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-bold text-blue-900">確信度・補足事項</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-blue-900">
          {output.confidenceNote}
        </p>
      </section>
    </div>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <span className="font-medium text-gray-700">{title}:</span>
      <ul className="mt-1 list-inside list-disc">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
