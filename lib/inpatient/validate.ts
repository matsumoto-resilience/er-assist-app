import { VALID_SEX_VALUES, VALID_USER_ROLES, validateVitals } from "../validate";
import type { InpatientInput } from "./types";

const LIMITS = {
  admissionDiagnosis: 200,
  currentTreatment: 2000,
  recentCourse: 4000,
  focusQuestion: 300,
  age: { min: 0, max: 120 },
  hospitalDay: { min: 0, max: 365 },
} as const;

const VALID_DEPARTMENTS = new Set(["cardiology", "pulmonology", "gastroenterology"]);

export function validateInpatientInput(input: unknown): string | null {
  if (typeof input !== "object" || input === null) {
    return "リクエストボディの形式が不正です。";
  }

  const candidate = input as Partial<InpatientInput>;

  if (typeof candidate.department !== "string" || !VALID_DEPARTMENTS.has(candidate.department)) {
    return "対象科の値が不正です。";
  }

  if (
    typeof candidate.admissionDiagnosis !== "string" ||
    candidate.admissionDiagnosis.trim() === ""
  ) {
    return "入院時診断・主病名を入力してください。";
  }
  if (candidate.admissionDiagnosis.length > LIMITS.admissionDiagnosis) {
    return `入院時診断・主病名は${LIMITS.admissionDiagnosis}文字以内で入力してください。`;
  }

  if (candidate.currentTreatment != null) {
    if (typeof candidate.currentTreatment !== "string") {
      return "現在の治療内容の形式が不正です。";
    }
    if (candidate.currentTreatment.length > LIMITS.currentTreatment) {
      return `現在の治療内容は${LIMITS.currentTreatment}文字以内で入力してください。`;
    }
  }

  if (candidate.recentCourse != null) {
    if (typeof candidate.recentCourse !== "string") {
      return "経過・検査結果の形式が不正です。";
    }
    if (candidate.recentCourse.length > LIMITS.recentCourse) {
      return `経過・検査結果は${LIMITS.recentCourse}文字以内で入力してください。`;
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

  if (candidate.hospitalDay != null) {
    if (
      typeof candidate.hospitalDay !== "number" ||
      !Number.isFinite(candidate.hospitalDay) ||
      candidate.hospitalDay < LIMITS.hospitalDay.min ||
      candidate.hospitalDay > LIMITS.hospitalDay.max
    ) {
      return "入院病日の値が不正です。";
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

  const vitalsError = validateVitals(candidate.vitals);
  if (vitalsError) return vitalsError;

  return null;
}
