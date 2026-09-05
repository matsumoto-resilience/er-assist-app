import type { UserRole } from "@/lib/types";

// アカウント登録時に選択する利用者区分。
// 「学生」は教育的な解説を厚めに、「医師」「コメディカル」は簡潔な臨床情報を優先する
// (回答スタイルの分岐は lib/prompt.ts の「## 利用者区分」を参照)。
export const USER_ROLES: readonly UserRole[] = ["student", "doctor", "comedical"];

export const ROLE_LABELS: Record<UserRole, string> = {
  student: "学生",
  doctor: "医師",
  comedical: "コメディカル",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  student: "学習目的。臨床推論の考え方を厚めに解説します。",
  doctor: "実臨床の参考目的。要点を簡潔にまとめます。",
  comedical: "多職種での参考目的。要点を簡潔にまとめます。",
};

export function isUserRole(value: unknown): value is UserRole {
  return (
    value === "student" || value === "doctor" || value === "comedical"
  );
}
