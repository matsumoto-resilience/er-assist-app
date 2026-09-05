// 症状検索の履歴はこの端末のlocalStorageにのみ保存する(サーバーには送信しない)。

const STORAGE_KEY = "erAssistOutpatientSearchHistory";
const MAX_HISTORY = 10;

export function loadSearchHistory(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return loadSearchHistory();
  const next = [trimmed, ...loadSearchHistory().filter((q) => q !== trimmed)].slice(
    0,
    MAX_HISTORY
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearSearchHistory(): string[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}
