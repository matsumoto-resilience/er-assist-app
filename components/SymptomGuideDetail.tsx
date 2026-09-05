import CategoryVisualDiagram from "@/components/CategoryVisualDiagram";
import DrugChoiceCard from "@/components/DrugChoiceCard";
import DrugSummaryTable from "@/components/DrugSummaryTable";
import LinkedText from "@/components/LinkedText";
import SelectionFlowView, { STEP_TYPE_META } from "@/components/SelectionFlowView";
import type { SelectionStepType, SymptomGuide } from "@/lib/symptom-guide/types";

export default function SymptomGuideDetail({ guide }: { guide: SymptomGuide<string, string> }) {
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-bold text-gray-900">
          {guide.categoryLabel}: 薬剤選択の考え方
        </h2>
        <div className="mt-3">
          <CategoryVisualDiagram overview={guide.visualOverview} />
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm text-gray-800">
          <LinkedText text={guide.overview} glossary={guide.glossaryTerms} />
        </p>
      </section>

      {guide.managementPoints.length > 0 && (
        <section className="rounded-md border border-teal-200 bg-teal-50 p-4">
          <h3 className="text-sm font-bold text-teal-900">疾患管理のポイント</h3>
          <dl className="mt-3 space-y-3">
            {guide.managementPoints.map((point, i) => (
              <div key={i}>
                <dt className="text-sm font-semibold text-teal-900">{point.title}</dt>
                <dd className="mt-1 text-sm text-teal-950">
                  <LinkedText text={point.description} glossary={guide.glossaryTerms} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900">選択の進め方</h3>
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
        <SelectionFlowView steps={guide.selectionFlow} glossary={guide.glossaryTerms} />
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900">薬剤概要(一覧)</h3>
        <div className="mt-3">
          <DrugSummaryTable drugs={guide.drugChoices} />
        </div>
      </section>

      <section className="rounded-md border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-bold text-gray-900">薬剤の選択肢(詳細)</h3>
        <div className="mt-3 space-y-3">
          {guide.drugChoices.map((drug, i) => (
            <DrugChoiceCard key={i} drug={drug} />
          ))}
        </div>
      </section>

      {guide.generalCautions.length > 0 && (
        <section className="rounded-md border border-red-300 bg-red-50 p-4">
          <h3 className="text-sm font-bold text-red-800">全体を通しての注意点</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-red-900">
            {guide.generalCautions.map((caution, i) => (
              <li key={i}>{caution}</li>
            ))}
          </ul>
        </section>
      )}

      {guide.references.length > 0 && (
        <section className="rounded-md border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-bold text-gray-900">参考文献</h3>
          <ul className="mt-2 space-y-1 text-xs text-gray-600">
            {guide.references.map((ref) => (
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
        </section>
      )}

      {guide.learnMoreLinks.length > 0 && (
        <section className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-bold text-blue-900">さらに詳しく学ぶ</h3>
          <p className="mt-1 text-xs text-blue-800">
            問診の進め方など、より実践的な内容は以下のページで確認できます。
          </p>
          <div className="mt-3 space-y-2">
            {guide.learnMoreLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border border-blue-200 bg-white p-3 transition hover:border-blue-400 hover:bg-blue-50"
              >
                <span className="text-sm font-semibold text-blue-800 underline">
                  {link.title}
                </span>
                <p className="mt-1 text-xs text-gray-600">{link.description}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
