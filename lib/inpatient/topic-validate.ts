const MAX_TOPIC_LENGTH = 100;

export function validateInpatientTopicInput(input: unknown): string | null {
  if (typeof input !== "object" || input === null) {
    return "リクエストボディの形式が不正です。";
  }

  const candidate = input as { topic?: unknown };

  if (typeof candidate.topic !== "string" || candidate.topic.trim() === "") {
    return "検索キーワードを入力してください。";
  }
  if (candidate.topic.length > MAX_TOPIC_LENGTH) {
    return `検索キーワードは${MAX_TOPIC_LENGTH}文字以内で入力してください。`;
  }

  return null;
}
