import ShoBadge from "@/components/ShoBadge";
import type { KampoFormulaChoice } from "@/lib/kampo/types";

export default function KampoFormulaCard({ formula }: { formula: KampoFormulaChoice }) {
  return (
    <div className="rounded-md border border-gray-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-gray-900">{formula.name}</span>
        <span className="text-xs text-gray-500">({formula.reading})</span>
      </div>

      {formula.brandNames.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          代表的な製品: {formula.brandNames.join("、")}
        </p>
      )}

      <ShoBadge shoType={formula.shoType} />

      {formula.keyConstituents.length > 0 && (
        <p className="mt-2 text-xs text-gray-500">
          主な構成生薬: {formula.keyConstituents.join("・")}
        </p>
      )}

      <div className="mt-2 space-y-1.5 text-sm text-gray-800">
        <p>
          <span className="text-xs font-medium text-gray-500">効果: </span>
          {formula.effect}
        </p>
        <p>
          <span className="text-xs font-medium text-gray-500">どう選ぶか: </span>
          {formula.whenToChoose}
        </p>
      </div>

      {formula.cautions.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-2.5">
          <span className="text-xs font-bold text-amber-900">副作用・注意点</span>
          <ul className="mt-1 list-inside list-disc text-sm text-amber-900">
            {formula.cautions.map((caution, i) => (
              <li key={i}>{caution}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
