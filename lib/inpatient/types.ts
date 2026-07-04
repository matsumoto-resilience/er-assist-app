import type { GuidelineReference, IdentifiedRedFlag, UserRole } from "../types";

// 現時点で対応する科(循環器内科・呼吸器内科・消化器内科)のみ選択可能。
// 他科は各科ガイドラインの調査・実在確認が完了するまで追加しない(ハルシネーション防止)。
export type InpatientDepartment = "cardiology" | "pulmonology" | "gastroenterology";

export const INPATIENT_DEPARTMENT_LABELS: Record<InpatientDepartment, string> = {
  cardiology: "循環器内科",
  pulmonology: "呼吸器内科",
  gastroenterology: "消化器内科",
};

export interface InpatientInput {
  department: InpatientDepartment;
  admissionDiagnosis: string; // 入院時診断・主病名
  hospitalDay?: number; // 入院病日
  currentTreatment: string; // 現在の治療内容(点滴・内服・酸素等)
  recentCourse: string; // 経過・直近の検査結果(フリーテキスト)
  focusQuestion?: string; // 特に確認したいポイント
  age?: number;
  sex?: "male" | "female" | "unknown";
  vitals: {
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    respiratoryRate?: number;
    spo2?: number;
    bodyTemp?: number;
    gcs?: number;
  };
  userRole?: UserRole;
}

// 鑑別すべき合併症・増悪因子
export interface ComplicationRisk {
  name: string;
  likelihood: "high" | "medium" | "low";
  rationale: string;
}

export interface InpatientTreatmentPlan {
  continueActions: string[]; // 継続すべき現行治療のポイント
  adjustments: string[]; // 治療内容の調整案
  workup: string[]; // 追加で検討すべき検査
  monitoring: string[]; // モニタリング項目
  dischargeCriteria: string; // 退院に向けた考え方・基準
}

export interface InpatientOutput {
  keyActions: string[]; // 直ちに行うべきことの要点
  keyWorkup: string[]; // 優先して確認すべき検査の要点
  assessmentPlan: string; // 現状評価
  complicationRisks: ComplicationRisk[]; // 鑑別すべき合併症・増悪因子
  monitoringChecklist: string[]; // 身体所見・検査モニタリングの集約チェックリスト
  treatmentPlan: InpatientTreatmentPlan;
  redFlagsIdentified: IdentifiedRedFlag[];
  confidenceNote: string;
}

// 科別知識ベースのエントリ(手動で実在確認済みの参考文献のみ登録)
export interface InpatientKnowledgeBaseEntry {
  department: InpatientDepartment;
  departmentLabel: string;
  topicKeywords: string[]; // 入院時診断・現病歴とのマッチング用キーワード
  warningSigns: string[]; // 増悪・合併症を示唆する警告所見
  guidelineNotes: string;
  flowchartSteps: string[];
  references: GuidelineReference[];
}
