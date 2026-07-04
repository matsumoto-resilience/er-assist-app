import type { PatientInput } from "./types";

// 異常に大きい/不正なペイロードによるコスト濫用・DoSを防ぐための入力検証。
const LIMITS = {
  chiefComplaint: 200,
  freeText: 4000,
  focusQuestion: 300,
  age: { min: 0, max: 120 },
  vitals: {
    systolicBP: { min: 0, max: 400 },
    diastolicBP: { min: 0, max: 300 },
    heartRate: { min: 0, max: 400 },
    respiratoryRate: { min: 0, max: 200 },
    spo2: { min: 0, max: 100 },
    bodyTemp: { min: 20, max: 45 },
    gcs: { min: 3, max: 15 },
  },
} as const;

const VALID_SEX_VALUES = new Set(["male", "female", "unknown"]);
const VALID_USER_ROLES = new Set(["student", "doctor"]);

export function validatePatientInput(input: unknown): string | null {
  if (typeof input !== "object" || input === null) {
    return "リクエストボディの形式が不正です。";
  }

  const candidate = input as Partial<PatientInput>;

  if (
    typeof candidate.chiefComplaint !== "string" ||
    candidate.chiefComplaint.trim() === ""
  ) {
    return "主訴を入力してください。";
  }
  if (candidate.chiefComplaint.length > LIMITS.chiefComplaint) {
    return `主訴は${LIMITS.chiefComplaint}文字以内で入力してください。`;
  }

  if (candidate.freeText != null) {
    if (typeof candidate.freeText !== "string") {
      return "フリーテキストの形式が不正です。";
    }
    if (candidate.freeText.length > LIMITS.freeText) {
      return `フリーテキストは${LIMITS.freeText}文字以内で入力してください。`;
    }
  }

  if (candidate.focusQuestion != null) {
    if (typeof candidate.focusQuestion !== "string") {
      return "確認したいポイントの形式が不正です。";
    }
    if (candidate.focusQuestion.length > LIMITS.focusQuestion) {
      return `確認したいポイントは${LIMITS.focusQuestion}文字以内で入力してください。`;
    }
  }

  if (candidate.age != null) {
    if (
      typeof candidate.age !== "number" ||
      !Number.isFinite(candidate.age) ||
      candidate.age < LIMITS.age.min ||
      candidate.age > LIMITS.age.max
    ) {
      return "年齢の値が不正です。";
    }
  }

  if (candidate.sex != null && !VALID_SEX_VALUES.has(candidate.sex)) {
    return "性別の値が不正です。";
  }

  if (candidate.userRole != null && !VALID_USER_ROLES.has(candidate.userRole)) {
    return "利用者区分の値が不正です。";
  }

  if (candidate.vitals != null) {
    if (typeof candidate.vitals !== "object") {
      return "バイタルサインの形式が不正です。";
    }
    for (const [key, range] of Object.entries(LIMITS.vitals)) {
      const value = (candidate.vitals as Record<string, unknown>)[key];
      if (value == null) continue;
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < range.min ||
        value > range.max
      ) {
        return `バイタルサイン(${key})の値が不正です。`;
      }
    }
  }

  return null;
}
