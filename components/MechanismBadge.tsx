import type { MechanismType } from "@/lib/symptom-guide/types";

const MECHANISM_META: Record<
  MechanismType,
  { label: string; badgeClass: string; iconClass: string }
> = {
  agonist: {
    label: "作動薬(受容体を刺激・活性化)",
    badgeClass: "border-green-300 bg-green-50 text-green-900",
    iconClass: "text-green-600",
  },
  antagonist: {
    label: "拮抗薬(受容体を遮断)",
    badgeClass: "border-red-300 bg-red-50 text-red-900",
    iconClass: "text-red-600",
  },
  inhibitor: {
    label: "阻害薬(酵素・チャネル等を阻害)",
    badgeClass: "border-amber-300 bg-amber-50 text-amber-900",
    iconClass: "text-amber-600",
  },
  other: {
    label: "その他・複合的な機序",
    badgeClass: "border-gray-300 bg-gray-50 text-gray-700",
    iconClass: "text-gray-500",
  },
};

function MechanismIcon({
  type,
  className,
}: {
  type: MechanismType;
  className?: string;
}) {
  switch (type) {
    case "agonist":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "antagonist":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M6.5 17.5l11-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "inhibitor":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
          <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
  }
}

export default function MechanismBadge({
  target,
  mechanismType,
}: {
  target: string;
  mechanismType: MechanismType;
}) {
  const meta = MECHANISM_META[mechanismType];
  return (
    <div className={`mt-2 flex items-start gap-2 rounded-md border p-2 ${meta.badgeClass}`}>
      <MechanismIcon
        type={mechanismType}
        className={`mt-0.5 h-5 w-5 shrink-0 ${meta.iconClass}`}
      />
      <div>
        <p className="text-xs font-bold">{meta.label}</p>
        <p className="text-xs">標的: {target}</p>
      </div>
    </div>
  );
}
