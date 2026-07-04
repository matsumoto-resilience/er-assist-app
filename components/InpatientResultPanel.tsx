"use client";

import CaseFeedback from "@/components/CaseFeedback";
import GuidelineReferencePanel from "@/components/GuidelineReferencePanel";
import { INPATIENT_DEPARTMENT_LABELS } from "@/lib/inpatient/types";
import type {
  InpatientInput,
  InpatientKnowledgeBaseEntry,
  InpatientOutput,
  InpatientTreatmentPlan,
} from "@/lib/inpatient/types";

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

function buildInpatientCaseReport(input: InpatientInput, output: InpatientOutput): string {
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

  return `# ER Assist 入院症例記録
生成日時: ${new Date().toLocaleString("ja-JP")}

## 患者情報
対象科: ${INPATIENT_DEPARTMENT_LABELS[input.department]}
入院時診断・主病名: ${input.admissionDiagnosis}
入院病日: ${input.hospitalDay != null ? `第${input.hospitalDay}病日` : "不明"}
年齢: ${input.age != null ? `${input.age}歳` : "不明"}
性別: ${sexLabel}
バイタルサイン: ${vitalsLines.length > 0 ? vitalsLines.join(", ") : "未入力"}
確認したいポイント: ${input.focusQuestion?.trim() || "(指定なし)"}

現在の治療内容:
${input.currentTreatment || "(記載なし)"}

経過・直近の検査結果:
${input.recentCourse || "(記載なし)"}

## 要点(直ちに行うべきこと)
${output.keyActions.map((p) => `- ${p}`).join("\n")}

## 要点(優先して確認すべき検査)
${output.keyWorkup.map((p) => `- ${p}`).join("\n")}

## 現状評価
${output.assessmentPlan}

## 鑑別すべき合併症・増悪因子
${output.complicationRisks
  .map(
    (risk) =>
      `- ${risk.name}(${likelihoodLabel[risk.likelihood] ?? risk.likelihood})\n  根拠: ${risk.rationale}`
  )
  .join("\n")}

## モニタリングチェックリスト
${output.monitoringChecklist.map((item) => `- ${item}`).join("\n")}

## 治療方針
継続すべき現行治療: ${output.treatmentPlan.continueActions.join(", ") || "-"}
治療内容の調整案: ${output.treatmentPlan.adjustments.join(", ") || "-"}
追加で検討すべき検査: ${output.treatmentPlan.workup.join(", ") || "-"}
モニタリング項目: ${output.treatmentPlan.monitoring.join(", ") || "-"}
退院に向けた考え方: ${output.treatmentPlan.dischargeCriteria}

## 警告所見
${
  output.redFlagsIdentified.length > 0
    ? output.redFlagsIdentified
        .map((rf) => `- ${rf.finding}(示唆される合併症・疾患: ${rf.suspectedDiseases.join("、") || "-"})`)
        .join("\n")
    : "特になし"
}

## 確信度・補足事項
${output.confidenceNote}

---
本記録はAIによる参考情報であり、最終的な治療方針は医師の責任において決定してください。
`;
}

function downloadInpatientCaseReport(input: InpatientInput, output: InpatientOutput) {
  const report = buildInpatientCaseReport(input, output);
  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const a = document.createElement("a");
  a.href = url;
  a.download = `er-assist-inpatient_${input.admissionDiagnosis.slice(0, 20)}_${timestamp}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function InpatientResultPanel({
  output,
  input,
  knowledgeBase,
  auditId,
}: {
  output: InpatientOutput;
  input: InpatientInput;
  knowledgeBase: InpatientKnowledgeBaseEntry[];
  auditId: string | null;
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => downloadInpatientCaseReport(input, output)}
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
          <h3 className="text-sm font-bold text-red-800">⚠ 特定された警告所見</h3>
          <ul className="mt-2 space-y-2 text-sm text-red-900">
            {output.redFlagsIdentified.map((flag, i) => (
              <li key={i}>
                <span className="font-medium">{flag.finding}</span>
                {flag.suspectedDiseases.length > 0 && (
                  <span className="block text-xs text-red-700">
                    示唆される合併症・疾患: {flag.suspectedDiseases.join("、")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900">現状評価</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
          {output.assessmentPlan}
        </p>
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900">鑑別すべき合併症・増悪因子</h3>
        <div className="mt-3 space-y-3">
          {output.complicationRisks.map((risk, i) => (
            <div key={i} className="rounded-md border border-gray-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-900">{risk.name}</span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                    likelihoodStyles[risk.likelihood] ?? likelihoodStyles.low
                  }`}
                >
                  {likelihoodLabel[risk.likelihood] ?? risk.likelihood}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-700">{risk.rationale}</p>
            </div>
          ))}
        </div>

        {output.monitoringChecklist.length > 0 && (
          <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
            <span className="text-xs font-medium text-gray-500">
              モニタリングチェックリスト(上記合併症リスクを横断して集約):
            </span>
            <ul className="mt-1 list-inside list-disc text-sm text-gray-700">
              {output.monitoringChecklist.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900">治療方針</h3>
        <InpatientTreatmentFlow plan={output.treatmentPlan} />
      </section>

      <section className="rounded-md border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-bold text-blue-900">確信度・補足事項</h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-blue-900">
          {output.confidenceNote}
        </p>
      </section>

      <GuidelineReferencePanel
        title="参考: 科別の初期評価フローと文献"
        scopeNote="本ツールの知識ベースに登録済みの科のみ表示しています。網羅的なものではありません。"
        groups={knowledgeBase.map((entry) => ({
          key: entry.department,
          label: entry.departmentLabel,
          flowchartSteps: entry.flowchartSteps,
          references: entry.references,
        }))}
      />

      <CaseFeedback auditId={auditId} />
    </div>
  );
}

function InpatientTreatmentFlow({ plan }: { plan: InpatientTreatmentPlan }) {
  const stages: { title: string; items: string[]; text?: string }[] = [
    { title: "継続すべき現行治療", items: plan.continueActions },
    { title: "治療内容の調整案", items: plan.adjustments },
    { title: "追加で検討すべき検査", items: plan.workup },
    { title: "モニタリング項目", items: plan.monitoring },
    { title: "退院に向けた考え方", items: [], text: plan.dischargeCriteria },
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
            {stage.text && <p className="mt-1 text-sm text-gray-800">{stage.text}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
