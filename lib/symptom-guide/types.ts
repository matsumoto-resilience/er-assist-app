import type { GuidelineReference } from "../types";

// 症状ガイド系モジュール(入院・外来等)で共通利用する型。
// モジュールごとの型ファイル(lib/inpatient/types.ts等)はここから再エクスポートし、
// カテゴリのUnion型やラベルのみモジュール固有に定義する。

// 薬剤の作用機序の種類(視覚的なアイコン・色分けに用いる)
// agonist: 受容体等を刺激・活性化する / antagonist: 受容体への結合を遮断する
// inhibitor: 酵素・チャネル・輸送体等の働きを阻害する / other: 上記に当てはまらない、または機序が複合的・不明瞭
export type MechanismType = "agonist" | "antagonist" | "inhibitor" | "other";

// 症状カテゴリ内で検討されうる薬剤の選択肢
export interface DrugChoice {
  name: string; // 薬剤名(一般名)
  brandNames: string[]; // 商品名(日本国内の代表的な先発品等)
  drugClass: string; // 薬効分類
  target: string; // 標的となる受容体・酵素・チャネル等
  mechanismType: MechanismType; // 作用機序の種類
  effect: string; // 効果・作用機序の要点
  whenToChoose: string; // どのような場合にこの薬を選ぶか(選択の考え方)
  cautions: string[]; // 副作用・注意点
}

// 疾患・症状に特有の管理のポイント(分類・目標値等、画面に直接表示する)
export interface ManagementPoint {
  title: string;
  description: string;
}

// 問診の進め方など、より実践的な内容を学ぶための外部リンク
export interface LearnMoreLink {
  title: string;
  description: string; // このリンクで何が学べるか
  url: string;
}

// 本文中の特定の用語をタップすると詳細ページに飛べるようにするための対応表
export interface GlossaryTerm {
  term: string; // 本文中でリンク化する語句(完全一致)
  url: string;
}

// カテゴリの全体像を視覚的に把握するための簡易図解(分類・スケール等)
export interface VisualSegment {
  label: string;
  sublabel?: string;
  colorClass: string; // Tailwindの背景色クラス
}

export interface VisualOverview {
  kind: "scale" | "steps"; // scale: 横並びの分類/尺度、steps: 段階的な増強を示す階段状
  caption: string; // 図の下に添える簡潔な説明
  segments: VisualSegment[];
  marker?: string; // scaleの場合に付記する目標値等の注記
}

// 選択の進め方の各ステップの種類(視覚的なアイコンに用いる)
// assess: 評価・確認 / decide: 判断・使い分け / treat: 薬剤・治療介入 / monitor: 経過観察・再評価
export type SelectionStepType = "assess" | "decide" | "treat" | "monitor";

export interface SelectionStep {
  text: string;
  type: SelectionStepType;
}

// 症状カテゴリごとの学習ガイド(手動で実在確認済みの内容のみ登録、AIには生成させない)
// TChoice: 薬剤選択肢の型(既定はDrugChoice。漢方薬モジュール等では方剤選択肢の型に差し替える)
export interface SymptomGuide<
  TCategory extends string,
  TGroup extends string = string,
  TChoice = DrugChoice,
> {
  category: TCategory;
  categoryLabel: string;
  group: TGroup;
  overview: string; // この症状に対する選択の全体的な考え方
  visualOverview: VisualOverview; // 大枠を視覚的に理解するための簡易図解
  managementPoints: ManagementPoint[]; // 疾患特異的な管理のポイント(分類・目標値等)
  selectionFlow: SelectionStep[]; // 選択の進め方(ステップ形式)
  drugChoices: TChoice[];
  generalCautions: string[]; // カテゴリ全体に共通する注意点
  references: GuidelineReference[];
  learnMoreLinks: LearnMoreLink[]; // 問診等、より実践的な内容を学ぶための外部リンク
  glossaryTerms: GlossaryTerm[]; // 本文中でタップして詳細に飛べる用語
}

// 一覧にない症状を検索した際のAI生成結果(薬剤名・受容体・作用機序等の具体的な薬理情報は含めない)
export interface AiTopicResult {
  topic: string; // 検索されたキーワード
  overview: string; // 概要・考え方
  selectionFlow: SelectionStep[]; // 選択の進め方(簡略版)
  generalCautions: string[];
  confidenceNote: string; // 確信度・不確実性についての注記
}
