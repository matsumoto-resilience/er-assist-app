// 患者情報の入力データ
export type UserRole = "student" | "doctor";

export interface PatientInput {
  chiefComplaint: string; // 主訴
  freeText: string; // フリーテキスト(現病歴・既往歴など)
  focusQuestion?: string; // 特に確認したいポイント(任意、出力を絞り込むため)
  userRole?: UserRole; // 利用者区分(学生=教育的な解説を厚めに、医師=簡潔な臨床情報を優先)
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
}

// 鑑別疾患
export interface DifferentialDiagnosis {
  name: string;
  likelihood: "high" | "medium" | "low";
  rationale: string;
  redFlagsToRuleOut: string[];
}

// 治療方針
export interface TreatmentPlan {
  immediateActions: string[];
  workup: string[];
  medications: string[];
  disposition: string;
  monitoring: string[];
}

// AI生成結果全体
export interface AssistOutput {
  keyPoints: string[]; // 最も重要な要点(3〜5個、画面上部に強調表示)
  assessmentPlan: string; // 診療方針
  differentialDiagnosis: DifferentialDiagnosis[]; // 鑑別疾患
  treatmentPlan: TreatmentPlan; // 治療方針
  redFlagsIdentified: string[]; // 知識ベースから照合されたレッドフラグ
  confidenceNote: string; // AIの確信度・不確実性についての注記
}

// 知識ベースのエントリ
export interface KnowledgeBaseEntry {
  chiefComplaintKeywords: string[];
  category: string;
  redFlags: string[];
  guidelineNotes: string;
}

// 監査ログ1件分
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  provider: string;
  modelId: string;
  input: PatientInput;
  output: AssistOutput | null;
  error: string | null;
  latencyMs: number;
}
