import inpatientData from "../knowledge-base/inpatient.json";
import type { InpatientDepartment, InpatientKnowledgeBaseEntry } from "./types";

const knowledgeBase = inpatientData as InpatientKnowledgeBaseEntry[];

// 選択された科に対応する知識ベースエントリを返す。
// 対応科が増えるまでは科ごとに1エントリのみ登録されている。
export function retrieveInpatientEntries(
  department: InpatientDepartment
): InpatientKnowledgeBaseEntry[] {
  return knowledgeBase.filter((entry) => entry.department === department);
}
