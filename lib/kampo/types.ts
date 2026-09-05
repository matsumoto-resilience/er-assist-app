import type { SelectionStep, SymptomGuide } from "../symptom-guide/types";

export type {
  ManagementPoint as KampoManagementPoint,
  LearnMoreLink as KampoLearnMoreLink,
  GlossaryTerm as KampoGlossaryTerm,
  VisualOverview as KampoVisualOverview,
  SelectionStep as KampoSelectionStep,
} from "../symptom-guide/types";

// 現時点で対応する症状カテゴリのみ選択可能。
// 他カテゴリは各処方のエビデンス・出典確認が完了するまで追加しない(ハルシネーション防止)。
export type KampoCategory =
  | "gi_weakness"
  | "constipation_kampo"
  | "cold_sensitivity"
  | "common_cold"
  | "menopause"
  | "postop_ileus"
  | "muscle_cramp";

export const KAMPO_CATEGORY_LABELS: Record<KampoCategory, string> = {
  gi_weakness: "胃腸虚弱・食欲不振",
  constipation_kampo: "便秘",
  cold_sensitivity: "冷え症",
  common_cold: "かぜ症候群",
  menopause: "更年期障害",
  postop_ileus: "術後腸管運動・イレウス予防",
  muscle_cramp: "こむら返り(筋痙攣)",
};

// カテゴリの大分類(一覧表示のグループ分けに用いる)
export type KampoCategoryGroup = "general" | "infection" | "gynecology" | "inpatient_adjunct";

export const KAMPO_CATEGORY_GROUP_LABELS: Record<KampoCategoryGroup, string> = {
  general: "冷え・胃腸虚弱・便秘などの一般的不調",
  infection: "かぜ・咳嗽などの感染症状",
  gynecology: "更年期障害・婦人科領域",
  inpatient_adjunct: "入院中に併用されやすい漢方",
};

// 証(体力・体質の目安)。西洋薬の受容体・作用機序に相当する漢方独自の分類軸。
export type ShoType = "虚証" | "実証" | "中間証";

// 症状カテゴリ内で検討されうる方剤の選択肢
export interface KampoFormulaChoice {
  name: string; // 方剤名
  reading: string; // よみ
  brandNames: string[]; // 代表的な医療用製品(例: ツムラ(1)等)
  shoType: ShoType; // 証(体力・体質の目安)
  keyConstituents: string[]; // 主な構成生薬
  effect: string; // 効果の要点
  whenToChoose: string; // どのような場合にこの処方を選ぶか(選択の考え方)
  cautions: string[]; // 副作用・注意点
}

// 症状カテゴリごとの漢方処方選択学習ガイド(手動で実在確認済みの内容のみ登録、AIには生成させない)
export type KampoGuide = SymptomGuide<KampoCategory, KampoCategoryGroup, KampoFormulaChoice>;

// 一覧にない症状を検索した際のAI生成結果(方剤名・生薬・証等の具体的な情報は含めない)
export interface KampoAiTopicResult {
  topic: string;
  overview: string;
  selectionFlow: SelectionStep[];
  generalCautions: string[];
  confidenceNote: string;
}
