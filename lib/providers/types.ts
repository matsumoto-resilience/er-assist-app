export class GenerationRefusedError extends Error {
  constructor(message = "AIが安全性の観点から生成を見送りました。") {
    super(message);
    this.name = "GenerationRefusedError";
  }
}

export interface GenerateParams {
  systemPrompt: string;
  outputSchema: Record<string, unknown>;
  userMessage: string;
}

export interface GenerateResult {
  output: unknown;
  modelId: string;
}

export type GenerateFn = (params: GenerateParams) => Promise<GenerateResult>;
