import type { VisualOverview } from "@/lib/symptom-guide/types";

const STEP_HEIGHT_CLASSES = ["h-10", "h-16", "h-24", "h-32", "h-40"];

export default function CategoryVisualDiagram({
  overview,
}: {
  overview: VisualOverview;
}) {
  return (
    <div>
      {overview.kind === "scale" ? (
        <div className="flex overflow-hidden rounded-lg border border-gray-200">
          {overview.segments.map((segment, i) => (
            <div
              key={i}
              className={`flex-1 px-2 py-4 text-center ${segment.colorClass}`}
            >
              <div className="text-xs font-bold text-gray-900">{segment.label}</div>
              {segment.sublabel && (
                <div className="mt-1 text-[11px] text-gray-800">{segment.sublabel}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* 棒グラフ部分だけを独立した行にして、下端を揃える(ラベル文字数の違いで棒の位置がずれないようにする)。 */}
          <div className="flex items-end gap-2">
            {overview.segments.map((segment, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-md ${segment.colorClass} ${
                  STEP_HEIGHT_CLASSES[Math.min(i, STEP_HEIGHT_CLASSES.length - 1)]
                }`}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {overview.segments.map((segment, i) => (
              <div key={i} className="flex-1 text-center">
                <div className="text-xs font-bold text-gray-900">{segment.label}</div>
                {segment.sublabel && (
                  <div className="mt-0.5 text-[11px] text-gray-600">{segment.sublabel}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {overview.marker && (
        <p className="mt-2 text-xs font-semibold text-blue-800">▼ {overview.marker}</p>
      )}
      <p className="mt-2 text-xs text-gray-500">{overview.caption}</p>
    </div>
  );
}
