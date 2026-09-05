import type { ShoType } from "@/lib/kampo/types";

const SHO_META: Record<
  ShoType,
  { description: string; badgeClass: string; iconClass: string; fillOpacity: number }
> = {
  実証: {
    description: "体力が充実している人向け",
    badgeClass: "border-red-300 bg-red-50 text-red-900",
    iconClass: "text-red-600",
    fillOpacity: 1,
  },
  中間証: {
    description: "体力が中等度の人向け",
    badgeClass: "border-amber-300 bg-amber-50 text-amber-900",
    iconClass: "text-amber-600",
    fillOpacity: 0.5,
  },
  虚証: {
    description: "体力が虚弱な人向け",
    badgeClass: "border-blue-300 bg-blue-50 text-blue-900",
    iconClass: "text-blue-600",
    fillOpacity: 0,
  },
};

export default function ShoBadge({ shoType }: { shoType: ShoType }) {
  const meta = SHO_META[shoType];
  return (
    <div className={`mt-2 flex items-start gap-2 rounded-md border p-2 ${meta.badgeClass}`}>
      <svg
        viewBox="0 0 24 24"
        className={`mt-0.5 h-5 w-5 shrink-0 ${meta.iconClass}`}
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke="currentColor"
          strokeWidth="2"
          fill="currentColor"
          fillOpacity={meta.fillOpacity}
        />
      </svg>
      <div>
        <p className="text-xs font-bold">証: {shoType}</p>
        <p className="text-xs">{meta.description}</p>
      </div>
    </div>
  );
}
