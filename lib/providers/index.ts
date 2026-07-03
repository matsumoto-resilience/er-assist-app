import { generateWithClaude } from "./claude";
import { generateWithGemini } from "./gemini";
import type { GenerateFn } from "./types";

export type LlmProviderId = "claude" | "gemini";

// LLM_PROVIDER 環境変数で切り替える。未設定時はClaude(既定)。
export function getActiveProviderId(): LlmProviderId {
  const raw = (process.env.LLM_PROVIDER ?? "claude").trim().toLowerCase();
  return raw === "gemini" ? "gemini" : "claude";
}

export function getGenerateFn(): GenerateFn {
  return getActiveProviderId() === "gemini"
    ? generateWithGemini
    : generateWithClaude;
}

export { GenerationRefusedError } from "./types";
