import { appendFile, mkdir } from "fs/promises";
import path from "path";
import type { AuditLogEntry } from "./types";

// NOTE: 将来的に医療機器プログラム(SaMD)としての承認を見据え、
// 「いつ・どのモデルで・どんな入力から・どんな出力を生成したか」を
// 追跡できるよう最小限の監査ログを残す。本番運用時はローカルファイルではなく
// 改ざん耐性のあるデータベース(WORM/追記専用ストレージ等)への保存に置き換えること。

const LOG_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(LOG_DIR, "audit-log.jsonl");

export async function appendAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(LOG_FILE, `${JSON.stringify(entry)}\n`, "utf-8");
  } catch (err) {
    // 監査ログの書き込み失敗はユーザー体験をブロックしないが、必ずサーバーログには残す
    console.error("[audit-log] failed to write entry", err);
  }
}
