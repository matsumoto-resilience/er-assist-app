import { appendFile, mkdir } from "fs/promises";
import path from "path";

// audit-log.ts と同様、本番運用時はローカルファイルではなくデータベースへの
// 保存に置き換えること(Vercel等のサーバーレス環境ではファイルシステムが永続化されない)。

const LOG_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(LOG_DIR, "feedback-log.jsonl");

export interface CaseFeedbackEntry {
  auditId: string;
  rating: "helpful" | "not_helpful";
  comment: string | null;
  timestamp: string;
}

export async function appendFeedbackLog(entry: CaseFeedbackEntry): Promise<void> {
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(LOG_FILE, `${JSON.stringify(entry)}\n`, "utf-8");
  } catch (err) {
    console.error("[feedback-log] failed to write entry", err);
  }
}
