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

# Clerk 認証(アプリ全体をログイン必須にする)。
# Vercel Marketplace で追加: vercel integration add clerk → vercel env pull .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くと、未ログインの場合はサインアップ画面
(`/sign-up`)へ誘導されます。メールアドレス・パスワード・区分(学生 / 医師 / コメディカル)で
アカウントを作成すると全モジュールを利用できます。区分は AI 回答の詳しさ(学生=教育的に厚め、
医師・コメディカル=簡潔)に反映され、ログイン後も変更できます。認証は
[Clerk](https://clerk.com)(Vercel Marketplace ネイティブ連携)を使用しています。

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
  SplashScreen.tsx              # 起動スプラッシュ画面(ブランド表示+免責事項)
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
proxy.ts                        # Clerk認証によるアプリ全体のログインゲート(Next.js Proxy)
app/sign-in/, app/sign-up/       # 青系デザインのログイン/新規登録画面(Clerkカスタムフロー)
```

## セキュリティ対策

複数人での共有・将来のデプロイを見据え、以下の対策を実装しています。

| 対策 | 内容 | 実装箇所 |
| --- | --- | --- |
| アクセス制限 | Clerkによる利用者ごとのアカウント認証。全ページ・全APIがログイン必須(`/sign-in` `/sign-up` `/privacy` のみ公開)。APIルートでも `requireUser()` で二重確認 | `proxy.ts` / `lib/require-auth.ts` |
| レート制限 | IPごとに1分間あたり10リクエストまで(APIコスト濫用・DoS対策) | `lib/rate-limit.ts` |
| 入力検証 | 主訴・フリーテキストの文字数上限、バイタルサインの数値範囲チェック | `lib/validate.ts` |
| リクエストサイズ制限 | 20KBを超えるリクエストボディを拒否 | `app/api/generate/route.ts` |
| セキュリティヘッダー | X-Frame-Options・Permissions-Policy・HSTS等は`next.config.ts`、CSPはClerk互換のものを`proxy.ts`で一括生成 | `next.config.ts` / `proxy.ts` |
| プロンプトインジェクション対策 | ユーザー入力を`<patient_data>`タグで明示的に区切り、指示ではなく臨床データとして扱うようシステムプロンプトで指示 | `lib/prompt.ts` |
| 秘密情報の管理 | APIキー・監査ログはサーバー側のみで扱い、`.gitignore`でリポジトリから除外 | `.gitignore` |

### 既知の制約・今後の課題

- **利用者区分(学生/医師/コメディカル)は Clerk の `unsafeMetadata` に保存**しており、本人がクライアント側から変更できる表示上の設定。権限境界ではない。施設単位のアクセス制御や区分の改ざん防止が必要になった段階で `publicMetadata` + サーバーAPIへ移行する。
- **`er-assist-app.vercel.app` はカスタムドメインを付けられない**ため、当面 Clerk は development instance で運用(利用上限あり)。本番運用時はカスタムドメイン取得 → Clerk production instance へ移行。
- **レート制限はプロセス内メモリ実装**のため、Vercel等の複数インスタンスにスケールする環境では機能しない。本番運用時はUpstash Redis等の共有ストアに置き換えること。
- **監査ログはローカルファイル**(`data/audit-log.jsonl`)。患者由来の情報を含むため、実運用時はアクセス制御されたデータベース・暗号化ストレージへの移行が必須。

## 今後の拡張候補

- 知識ベースの拡充・出典(ガイドライン等)の明示
- 監査ログのDB化・改ざん耐性のあるストレージへの移行
- 施設ごとのアクセス制御・区分(ロール)の改ざん防止(Clerk `publicMetadata` 化)
- モバイル対応の最適化
- SaMD化を見据えたバリデーション・トレーサビリティ要件の整備
- 2プロバイダーの出力比較・A/Bテスト機能
