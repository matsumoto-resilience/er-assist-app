import type { GuidelineReference } from "@/lib/types";

export interface GuidelineReferenceGroup {
  key: string;
  label: string;
  flowchartSteps: string[];
  references: GuidelineReference[];
}

export default function GuidelineReferencePanel({
  title,
  scopeNote,
  groups,
}: {
  title: string;
  scopeNote: string;
  groups: GuidelineReferenceGroup[];
}) {
  if (groups.length === 0) return null;
  return (
    <section className="rounded-md border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-1 text-xs text-gray-500">{scopeNote}</p>
      <div className="mt-3 space-y-4">
        {groups.map((group) => (
          <div key={group.key} className="rounded-md border border-gray-200 p-3">
            <span className="text-sm font-semibold text-gray-900">{group.label}</span>
            {group.flowchartSteps.length > 0 && (
              <ol className="mt-2 space-y-1">
                {group.flowchartSteps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-800">
                    <span className="shrink-0 font-semibold text-gray-400">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
            {group.references.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-gray-100 pt-2 text-xs text-gray-600">
                {group.references.map((ref) => (
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
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
