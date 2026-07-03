import redFlagsData from "./red-flags.json";
import type { KnowledgeBaseEntry } from "../types";

const knowledgeBase = redFlagsData as KnowledgeBaseEntry[];

/**
 * 主訴・フリーテキストに含まれるキーワードから該当する知識ベースエントリを抽出する。
 * 単純なキーワードマッチによる軽量RAG。
 */
export function retrieveRelevantEntries(
  chiefComplaint: string,
  freeText: string
): KnowledgeBaseEntry[] {
  const haystack = `${chiefComplaint} ${freeText}`;
  return knowledgeBase.filter((entry) =>
    entry.chiefComplaintKeywords.some((keyword) => haystack.includes(keyword))
  );
}
