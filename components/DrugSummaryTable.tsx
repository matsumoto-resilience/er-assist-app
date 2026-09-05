import type { DrugChoice } from "@/lib/symptom-guide/types";

export default function DrugSummaryTable({ drugs }: { drugs: DrugChoice[] }) {
  if (drugs.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-gray-50 text-xs font-medium text-gray-500">
          <tr>
            <th className="px-3 py-2">薬剤名</th>
            <th className="px-3 py-2">商品名</th>
            <th className="px-3 py-2">薬効分類</th>
            <th className="px-3 py-2">効果の要点</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {drugs.map((drug, i) => (
            <tr key={i} className="align-top">
              <td className="px-3 py-2 font-semibold text-gray-900">{drug.name}</td>
              <td className="px-3 py-2 text-gray-600">{drug.brandNames.join("、") || "-"}</td>
              <td className="px-3 py-2 text-gray-600">{drug.drugClass}</td>
              <td className="px-3 py-2 text-gray-700">{drug.effect}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
