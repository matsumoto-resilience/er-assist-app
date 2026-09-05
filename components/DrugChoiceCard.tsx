import MechanismBadge from "@/components/MechanismBadge";
import type { DrugChoice } from "@/lib/symptom-guide/types";

export default function DrugChoiceCard({ drug }: { drug: DrugChoice }) {
  return (
    <div className="rounded-md border border-gray-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-gray-900">{drug.name}</span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
          {drug.drugClass}
        </span>
      </div>

      {drug.brandNames.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          商品名: {drug.brandNames.join("、")}
        </p>
      )}

      <MechanismBadge target={drug.target} mechanismType={drug.mechanismType} />

      <div className="mt-2 space-y-1.5 text-sm text-gray-800">
        <p>
          <span className="text-xs font-medium text-gray-500">効果: </span>
          {drug.effect}
        </p>
        <p>
          <span className="text-xs font-medium text-gray-500">どう選ぶか: </span>
          {drug.whenToChoose}
        </p>
      </div>

      {drug.cautions.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-2.5">
          <span className="text-xs font-bold text-amber-900">副作用・注意点</span>
          <ul className="mt-1 list-inside list-disc text-sm text-amber-900">
            {drug.cautions.map((caution, i) => (
              <li key={i}>{caution}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
