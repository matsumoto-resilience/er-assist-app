import SelectionFlowView, { STEP_TYPE_META } from "@/components/SelectionFlowView";
import type { AiTopicResult, SelectionStepType } from "@/lib/symptom-guide/types";

export default function AiTopicResultPanel({
  result,
  disclaimer = "この内容は既存の検証済みカテゴリとは異なり、AIがその場で生成したものです。薬剤名・商品名・受容体・作用機序等の具体的な薬理情報は誤りのリスクを避けるため含めていません。内容の正確性は保証されないため、必ず一次資料・指導医に確認してください。",
}: {
  result: AiTopicResult;
  disclaimer?: string;
}) {
  return (
    <div className="space-y-4 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 p-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-xs font-bold text-white">
          AI生成・未検証
        </span>
        <span className="text-sm font-bold text-purple-900">
          「{result.topic}」についてのAI生成結果
        </span>
      </div>
      <p className="text-xs text-purple-800">{disclaimer}</p>

      <section className="rounded-md border border-purple-200 bg-white p-3">
        <h4 className="text-sm font-bold text-gray-900">概要・考え方</h4>
        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{result.overview}</p>
      </section>

      {result.selectionFlow.length > 0 && (
        <section className="rounded-md border border-purple-200 bg-white p-3">
          <h4 className="text-sm font-bold text-gray-900">対応の進め方</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(STEP_TYPE_META) as SelectionStepType[]).map((type) => (
              <span
                key={type}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STEP_TYPE_META[type].chipClass}`}
              >
                {STEP_TYPE_META[type].label}
              </span>
            ))}
          </div>
          <SelectionFlowView steps={result.selectionFlow} />
        </section>
      )}

      {result.generalCautions.length > 0 && (
        <section className="rounded-md border border-red-300 bg-red-50 p-3">
          <h4 className="text-sm font-bold text-red-800">注意点</h4>
          <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-red-900">
            {result.generalCautions.map((caution, i) => (
              <li key={i}>{caution}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-md border border-purple-200 bg-white p-3">
        <h4 className="text-sm font-bold text-gray-900">確信度・補足事項</h4>
        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{result.confidenceNote}</p>
      </section>
    </div>
  );
}
