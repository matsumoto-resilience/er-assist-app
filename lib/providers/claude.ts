import { CLAUDE_MODEL_ID, getAnthropicClient } from "../anthropic";
import { buildOutputSchema, buildUserMessage, SYSTEM_PROMPT } from "../prompt";
import { GenerationRefusedError, type GenerateFn } from "./types";

export const generateWithClaude: GenerateFn = async (input, kbEntries) => {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: CLAUDE_MODEL_ID,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: buildOutputSchema(),
    },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: buildUserMessage(input, kbEntries),
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new GenerationRefusedError();
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claudeからテキスト応答が得られませんでした。");
  }

  return {
    output: JSON.parse(textBlock.text),
    modelId: response.model,
  };
};
