import LinkedText from "@/components/LinkedText";
import type {
  GlossaryTerm,
  SelectionStep,
  SelectionStepType,
} from "@/lib/symptom-guide/types";

export const STEP_TYPE_META: Record<
  SelectionStepType,
  { label: string; circleClass: string; chipClass: string }
> = {
  assess: {
    label: "評価・確認",
    circleClass: "bg-sky-600",
    chipClass: "bg-sky-100 text-sky-800",
  },
  decide: {
    label: "判断・使い分け",
    circleClass: "bg-purple-600",
    chipClass: "bg-purple-100 text-purple-800",
  },
  treat: {
    label: "薬剤・治療介入",
    circleClass: "bg-green-600",
    chipClass: "bg-green-100 text-green-800",
  },
  monitor: {
    label: "経過観察・再評価",
    circleClass: "bg-amber-600",
    chipClass: "bg-amber-100 text-amber-800",
  },
};

export default function SelectionFlowView({
  steps,
  glossary = [],
}: {
  steps: SelectionStep[];
  glossary?: GlossaryTerm[];
}) {
  return (
    <div className="mt-3">
      {steps.map((step, i) => {
        const meta = STEP_TYPE_META[step.type];
        return (
          <div key={i} className="relative flex gap-3 pb-5 last:pb-0">
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 bottom-0 w-px bg-blue-200"
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${meta.circleClass}`}
            >
              {i + 1}
            </span>
            <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.chipClass}`}
              >
                {meta.label}
              </span>
              <p className="mt-1.5 text-sm text-gray-800">
                <LinkedText text={step.text} glossary={glossary} />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
