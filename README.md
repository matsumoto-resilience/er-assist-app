# ER Assist — 救急外来 臨床意思決定支援(プロトタイプ)

研修医・レジデントが救急外来で患者を診る際、**診療方針・鑑別疾患・治療方針**を
AI(Claude / Gemini)と知識ベースのハイブリッドで整理する支援ツールのプロトタイプです。

> ⚠️ 本ツールは診断・治療を確定するものではなく、あくまで参考情報を提供するものです。
> 最終判断は必ず指導医・担当医が行ってください。医療機器としての承認は受けていません。

## 主な機能

- 主訴・フリーテキスト・バイタルサインの入力(フォーム + 自由記述)
- 主訴に応じた「Red Flag知識ベース」(`lib/knowledge-base/red-flags.json`)をキーワードマッチで検索し、プロンプトに組み込む簡易RAG
- 構造化出力(JSON Schema)で、診療方針・鑑別疾患・治療方針をJSON形式で生成
- **LLMプロバイダーを環境変数で切り替え可能**(Claude Opus 4.8 / Gemini 3.1 Pro Preview)
- 将来的な医療機器プログラム(SaMD)承認を見据えた最小限の監査ログ(`data/audit-log.jsonl`、入力・出力・プロバイダー・モデルID・タイムスタンプを記録)

## セットアップ

```bash
npm install
cp .env.local.example .env.local
```

`.env.local` を編集し、使用するプロバイダーとAPIキーを設定してください。

```env
# "claude" または "gemini"
LLM_PROVIDER=claude

# LLM_PROVIDER=claude のとき必要
ANTHROPIC_API_KEY=sk-ant-api03-...

# LLM_PROVIDER=gemini のとき必要
GEMINI_API_KEY=...
```

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いて動作確認できます。

### プロバイダーの違い

| 項目 | Claude | Gemini |
| --- | --- | --- |
| モデル | `claude-opus-4-8` | `gemini-3.1-pro-preview` |
| APIキー取得元 | [console.anthropic.com](https://console.anthropic.com/settings/keys) | [aistudio.google.com](https://aistudio.google.com/apikey) |
| ステータス | GA(正式提供) | Preview(仕様変更の可能性あり) |
| 無料枠 | クレジット残高が必要 | `gemini-3.1-pro-preview`は無料枠のクォータが0。利用するにはGoogle Cloudプロジェクトで課金を有効化する必要がある |

## 構成

```text
app/
  page.tsx                    # メイン画面
  api/generate/route.ts       # 生成API(プロバイダー呼び出し・監査ログ記録)
components/
  PatientForm.tsx              # 患者情報入力フォーム
  ResultPanel.tsx               # 生成結果表示
  DisclaimerBanner.tsx          # 免責事項バナー
lib/
  types.ts                      # 共通型定義
  anthropic.ts                   # Anthropicクライアント
  prompt.ts                      # システムプロンプト・出力スキーマ・ユーザーメッセージ構築(プロバイダー非依存)
  audit-log.ts                    # 監査ログ書き込み
  providers/
    types.ts                      # プロバイダー共通インターフェース
    claude.ts                      # Claude実装
    gemini.ts                      # Gemini実装
    index.ts                       # LLM_PROVIDER環境変数によるプロバイダー切り替え
  knowledge-base/
    red-flags.json                # 主訴ごとのRed Flag知識ベース
    retrieve.ts                    # キーワードマッチによる簡易RAG
data/
  audit-log.jsonl                # 実行時に生成される監査ログ(gitignore対象)
```

## 今後の拡張候補

- 知識ベースの拡充・出典(ガイドライン等)の明示
- 監査ログのDB化・改ざん耐性のあるストレージへの移行
- ユーザー認証・施設ごとのアクセス制御
- モバイル対応の最適化
- SaMD化を見据えたバリデーション・トレーサビリティ要件の整備
- 2プロバイダーの出力比較・A/Bテスト機能
