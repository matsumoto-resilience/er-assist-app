import type { SymptomGuide, AiTopicResult } from "../symptom-guide/types";

export type {
  DrugChoice as InpatientDrugChoice,
  ManagementPoint as InpatientManagementPoint,
  LearnMoreLink as InpatientLearnMoreLink,
  GlossaryTerm as InpatientGlossaryTerm,
  VisualSegment as InpatientVisualSegment,
  VisualOverview as InpatientVisualOverview,
  SelectionStepType as InpatientSelectionStepType,
  SelectionStep as InpatientSelectionStep,
  MechanismType as InpatientMechanismType,
} from "../symptom-guide/types";

// 現時点で対応する症状カテゴリ(入院中によく遭遇する症状管理+主要な慢性疾患管理)のみ選択可能。
// 他カテゴリは各領域ガイドラインの調査・実在確認が完了するまで追加しない(ハルシネーション防止)。
export type InpatientSymptomCategory =
  | "insomnia"
  | "constipation"
  | "pain"
  | "nausea"
  | "hypertension"
  | "diabetes"
  | "delirium"
  | "fever"
  | "cough"
  | "pruritus"
  | "diarrhea"
  | "edema"
  | "anxiety"
  | "dyslipidemia";

export const INPATIENT_SYMPTOM_CATEGORY_LABELS: Record<InpatientSymptomCategory, string> = {
  insomnia: "不眠",
  constipation: "便秘",
  pain: "疼痛",
  nausea: "悪心・嘔吐",
  hypertension: "高血圧",
  diabetes: "糖尿病",
  delirium: "せん妄",
  fever: "発熱",
  cough: "咳嗽・喀痰",
  pruritus: "掻痒感",
  diarrhea: "下痢",
  edema: "浮腫",
  anxiety: "不安",
  dyslipidemia: "脂質異常症",
};

// カテゴリの大分類(一覧表示のグループ分けに用いる)
export type InpatientCategoryGroup = "symptom" | "chronic";

export const INPATIENT_CATEGORY_GROUP_LABELS: Record<InpatientCategoryGroup, string> = {
  symptom: "症状管理",
  chronic: "慢性疾患管理",
};

// 症状カテゴリごとの薬剤選択学習ガイド(手動で実在確認済みの内容のみ登録、AIには生成させない)
export type InpatientSymptomGuide = SymptomGuide<
  InpatientSymptomCategory,
  InpatientCategoryGroup
>;

// 一覧にない症状を検索した際のAI生成結果(薬剤名・受容体・作用機序等の具体的な薬理情報は含めない)
export type InpatientAiTopicResult = AiTopicResult;
