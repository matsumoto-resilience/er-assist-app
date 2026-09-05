// 患者情報の入力データ
// 利用者区分。アカウント登録時に選択し、Clerkのユーザーメタデータに保存する。
export type UserRole = "student" | "doctor" | "comedical";

// バイタルサイン(ER・外来・入院の各モジュールで共通)
export interface Vitals {
  systolicBP?: number;
  diastolicBP?: number;
  heartRate?: number;
  respiratoryRate?: number;
  spo2?: number;
  bodyTemp?: number;
  gcs?: number;
}

export interface PatientInput {
  chiefComplaint: string; // 主訴
  freeText: string; // フリーテキスト(現病歴・既往歴など)
  focusQuestion?: string; // 特に確認したいポイント(任意、出力を絞り込むため)
  userRole?: UserRole; // 利用者区分(学生=教育的な解説を厚めに、医師・コメディカル=簡潔な臨床情報を優先)
  age?: number;
  sex?: "male" | "female" | "unknown";
  vitals: Vitals;
}

// 鑑別疾患
export interface DifferentialDiagnosis {
  name: string;
  likelihood: "high" | "medium" | "low";
  rationale: string;
}

// 治療方針
export interface TreatmentPlan {
  immediateActions: string[];
  workup: string[];
  medications: string[];
  disposition: string;
  monitoring: string[];
}

// 入力情報から特定されたred flagと、それが示唆する疾患
export interface IdentifiedRedFlag {
  finding: string; // 所見・red flagそのもの
  suspectedDiseases: string[]; // その所見が示唆する疾患
}

// 症状に対する薬剤選択肢(一般名ベース、外来・入院で共通)
export interface MedicationOption {
  name: string; // 薬剤名(一般名)
  usageNotes: string; // 選択の考え方・用法上のポイント
}

// 症状別の薬剤選択・副作用注意点
export interface SymptomMedicationGuide {
  symptom: string; // 対象となる症状
  medicationOptions: MedicationOption[]; // 当該症状に対する薬剤選択肢
  sideEffectCautions: string[]; // 副作用・相互作用等の注意点
}

// AI生成結果全体
export interface AssistOutput {
  keyActions: string[]; // 直ちに行うべきことの要点(3〜5個)
  keyWorkup: string[]; // 優先して確認・実施すべき検査の要点(3〜5個)
  assessmentPlan: string; // 診療方針
  differentialDiagnosis: DifferentialDiagnosis[]; // 鑑別疾患
  physicalExamChecklist: string[]; // 鑑別のために確認すべき身体所見(全鑑別疾患を横断して集約・重複排除)
  treatmentPlan: TreatmentPlan; // 治療方針
  redFlagsIdentified: IdentifiedRedFlag[]; // 知識ベースから照合されたred flagと示唆される疾患
  confidenceNote: string; // AIの確信度・不確実性についての注記
}

// 参考文献(人手で実在確認済みのものだけを登録し、AIには生成させない)
export interface GuidelineReference {
  title: string;
  url: string;
}

// 知識ベースのエントリ
export interface KnowledgeBaseEntry {
  chiefComplaintKeywords: string[];
  category: string;
  redFlags: string[];
  guidelineNotes: string;
  flowchartSteps: string[]; // 初期評価の一般的な流れ(簡易フローチャート表示用)
  references: GuidelineReference[]; // 実在確認済みの参考文献(未確認の主訴は空配列)
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
