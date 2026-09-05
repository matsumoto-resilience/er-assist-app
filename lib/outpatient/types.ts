import type { AiTopicResult, SymptomGuide } from "../symptom-guide/types";

export type {
  DrugChoice as OutpatientDrugChoice,
  ManagementPoint as OutpatientManagementPoint,
  LearnMoreLink as OutpatientLearnMoreLink,
  GlossaryTerm as OutpatientGlossaryTerm,
  VisualSegment as OutpatientVisualSegment,
  VisualOverview as OutpatientVisualOverview,
  SelectionStepType as OutpatientSelectionStepType,
  SelectionStep as OutpatientSelectionStep,
  MechanismType as OutpatientMechanismType,
} from "../symptom-guide/types";

// 現時点で対応する症状カテゴリ(高血圧・糖尿病・感冒/上気道炎・不眠)のみ選択可能。
// 他カテゴリは各領域ガイドラインの調査・実在確認が完了するまで追加しない(ハルシネーション防止)。
export type OutpatientCategory = "hypertension" | "diabetes" | "urti" | "insomnia";

export const OUTPATIENT_CATEGORY_LABELS: Record<OutpatientCategory, string> = {
  hypertension: "高血圧",
  diabetes: "糖尿病",
  urti: "感冒・上気道炎",
  insomnia: "不眠",
};

// カテゴリの大分類(一覧表示のグループ分けに用いる)
export type OutpatientCategoryGroup = "symptom" | "chronic";

export const OUTPATIENT_CATEGORY_GROUP_LABELS: Record<OutpatientCategoryGroup, string> = {
  symptom: "症状管理",
  chronic: "慢性疾患管理",
};

// 症状カテゴリごとの薬剤選択学習ガイド(手動で実在確認済みの内容のみ登録、AIには生成させない)
export type OutpatientSymptomGuide = SymptomGuide<
  OutpatientCategory,
  OutpatientCategoryGroup
>;

// 一覧にない症状を検索した際のAI生成結果(薬剤名・受容体・作用機序等の具体的な薬理情報は含めない)
export type OutpatientAiTopicResult = AiTopicResult;
