import type { AssistOutput, KnowledgeBaseEntry, PatientInput } from "./types";

// 症例履歴はこの端末のlocalStorageにのみ保存する(サーバーには送信しない)。
// 直近MAX_HISTORY件を超えると古いものから削除する。

const HISTORY_STORAGE_KEY = "erAssistCaseHistory";
const MAX_HISTORY = 30;

export interface CaseHistoryEntry {
  id: string;
  timestamp: string;
  input: PatientInput;
  output: AssistOutput;
  knowledgeBase: KnowledgeBaseEntry[];
  auditId: string | null;
}

export function loadCaseHistory(): CaseHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(entries: CaseHistoryEntry[]) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
}

export function addCaseHistoryEntry(
  entry: Omit<CaseHistoryEntry, "id" | "timestamp">
): CaseHistoryEntry[] {
  const newEntry: CaseHistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  const next = [newEntry, ...loadCaseHistory()].slice(0, MAX_HISTORY);
  persist(next);
  return next;
}

export function removeCaseHistoryEntry(id: string): CaseHistoryEntry[] {
  const next = loadCaseHistory().filter((entry) => entry.id !== id);
  persist(next);
  return next;
}

export function clearCaseHistory(): CaseHistoryEntry[] {
  persist([]);
  return [];
}
