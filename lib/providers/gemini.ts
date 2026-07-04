import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { GenerationRefusedError, type GenerateFn } from "./types";

// 2026-07時点でのGemini 3.1 pro preview モデル。
// GA(正式提供)ではなくpreviewのため、将来的にモデルIDが変わる可能性がある点に注意。
// 無料枠ではクォータが0のため、課金が有効なプロジェクトのAPIキーが必要。
export const GEMINI_MODEL_ID = "gemini-3.1-pro-preview";

let client: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

// Claudeの stop_reason: "refusal" に相当する、安全性起因の生成停止理由
const REFUSAL_FINISH_REASONS = new Set([
  "SAFETY",
  "PROHIBITED_CONTENT",
  "BLOCKLIST",
  "SPII",
  "RECITATION",
]);

export const generateWithGemini: GenerateFn = async ({
  systemPrompt,
  outputSchema,
  userMessage,
}) => {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_ID,
    contents: userMessage,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseJsonSchema: outputSchema,
      maxOutputTokens: 8000,
      thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
    },
  });

  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason && REFUSAL_FINISH_REASONS.has(finishReason)) {
    throw new GenerationRefusedError();
  }

  const text = response.text;
  if (!text) {
    throw new Error("Geminiからテキスト応答が得られませんでした。");
  }

  return {
    output: JSON.parse(text),
    modelId: GEMINI_MODEL_ID,
  };
};
