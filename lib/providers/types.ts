import type { AssistOutput, KnowledgeBaseEntry, PatientInput } from "../types";

export class GenerationRefusedError extends Error {
  constructor(message = "AIが安全性の観点から生成を見送りました。") {
    super(message);
    this.name = "GenerationRefusedError";
  }
}

export interface GenerateResult {
  output: AssistOutput;
  modelId: string;
}

export type GenerateFn = (
  input: PatientInput,
  kbEntries: KnowledgeBaseEntry[]
) => Promise<GenerateResult>;
