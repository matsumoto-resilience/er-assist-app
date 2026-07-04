// 症例履歴はこの端末のlocalStorageにのみ保存する(サーバーには送信しない)。
// モジュール(ER/外来/入院)ごとにstorageKeyを分けて履歴が混ざらないようにする。
// 直近MAX_HISTORY件を超えると古いものから削除する。

const MAX_HISTORY = 30;

export interface CaseHistoryEntry<TInput, TOutput, TKnowledgeBase = unknown> {
  id: string;
  timestamp: string;
  input: TInput;
  output: TOutput;
  knowledgeBase: TKnowledgeBase[];
  auditId: string | null;
}

export function loadCaseHistory<TInput, TOutput, TKnowledgeBase = unknown>(
  storageKey: string
): CaseHistoryEntry<TInput, TOutput, TKnowledgeBase>[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(storageKey: string, entries: unknown[]) {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

export function addCaseHistoryEntry<TInput, TOutput, TKnowledgeBase = unknown>(
  storageKey: string,
  entry: Omit<CaseHistoryEntry<TInput, TOutput, TKnowledgeBase>, "id" | "timestamp">
): CaseHistoryEntry<TInput, TOutput, TKnowledgeBase>[] {
  const newEntry: CaseHistoryEntry<TInput, TOutput, TKnowledgeBase> = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  const next = [
    newEntry,
    ...loadCaseHistory<TInput, TOutput, TKnowledgeBase>(storageKey),
  ].slice(0, MAX_HISTORY);
  persist(storageKey, next);
  return next;
}

export function removeCaseHistoryEntry<TInput, TOutput, TKnowledgeBase = unknown>(
  storageKey: string,
  id: string
): CaseHistoryEntry<TInput, TOutput, TKnowledgeBase>[] {
  const next = loadCaseHistory<TInput, TOutput, TKnowledgeBase>(storageKey).filter(
    (entry) => entry.id !== id
  );
  persist(storageKey, next);
  return next;
}

export function clearCaseHistory(storageKey: string): never[] {
  persist(storageKey, []);
  return [];
}
