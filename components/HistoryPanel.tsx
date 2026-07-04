"use client";

import type { CaseHistoryEntry } from "@/lib/case-history";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPanel({
  entries,
  onSelect,
  onRemove,
  onClear,
}: {
  entries: CaseHistoryEntry[];
  onSelect: (entry: CaseHistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">
          症例履歴(この端末に直近{entries.length}件を保存)
        </h2>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm("履歴を全て削除しますか?この操作は取り消せません。")) {
                onClear();
              }
            }}
            className="text-xs text-red-600 underline hover:text-red-800"
          >
            全て削除
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-gray-400">
          まだ履歴がありません。診療方針を生成すると、ここに記録されます。
        </p>
      ) : (
        <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-2"
            >
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-sm font-medium text-gray-900">
                  {entry.input.chiefComplaint || "(主訴未入力)"}
                </span>
                <span className="block text-xs text-gray-500">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(entry.id)}
                aria-label="この履歴を削除"
                className="shrink-0 text-xs text-gray-400 hover:text-red-600"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
