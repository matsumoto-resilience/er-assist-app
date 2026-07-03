import type { AssistOutput } from "@/lib/types";

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

export default function ResultPanel({ output }: { output: AssistOutput }) {
  return (
    <div className="space-y-6">
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
