import type { KampoFormulaChoice } from "@/lib/kampo/types";

export default function KampoFormulaSummaryTable({
  formulas,
}: {
  formulas: KampoFormulaChoice[];
}) {
  if (formulas.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-gray-50 text-xs font-medium text-gray-500">
          <tr>
            <th className="px-3 py-2">方剤名</th>
            <th className="px-3 py-2">証</th>
            <th className="px-3 py-2">代表的な製品</th>
            <th className="px-3 py-2">効果の要点</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {formulas.map((formula, i) => (
            <tr key={i} className="align-top">
              <td className="px-3 py-2 font-semibold text-gray-900">
                {formula.name}
                <span className="ml-1 font-normal text-gray-400">({formula.reading})</span>
              </td>
              <td className="px-3 py-2 text-gray-600">{formula.shoType}</td>
              <td className="px-3 py-2 text-gray-600">
                {formula.brandNames.join("、") || "-"}
              </td>
              <td className="px-3 py-2 text-gray-700">{formula.effect}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
