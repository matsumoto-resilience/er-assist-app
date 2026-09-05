import type { SymptomMedicationGuide } from "@/lib/types";

export default function SymptomMedicationCard({ guide }: { guide: SymptomMedicationGuide }) {
  return (
    <div className="rounded-md border border-gray-200 p-3">
      <span className="inline-block rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-bold text-white">
        {guide.symptom}
      </span>

      {guide.medicationOptions.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium text-gray-500">薬剤選択肢</span>
          <ul className="mt-1 space-y-1.5">
            {guide.medicationOptions.map((option, i) => (
              <li key={i} className="text-sm text-gray-800">
                <span className="font-semibold">{option.name}</span>
                <span className="text-gray-600"> — {option.usageNotes}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {guide.sideEffectCautions.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-2.5">
          <span className="text-xs font-bold text-amber-900">副作用・注意点</span>
          <ul className="mt-1 list-inside list-disc text-sm text-amber-900">
            {guide.sideEffectCautions.map((caution, i) => (
              <li key={i}>{caution}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
