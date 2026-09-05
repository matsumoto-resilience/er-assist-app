"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { USER_ROLES, ROLE_LABELS } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

// ログイン後に利用者区分を変更する小さなUI。
// 区分は Clerk の unsafeMetadata.role に保存する(本人が変更可能な表示上の設定)。
export default function RoleSwitcher({ current }: { current: UserRole }) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function change(next: UserRole) {
    if (!user || next === current) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      await user.update({
        unsafeMetadata: { ...user.unsafeMetadata, role: next },
      });
    } finally {
      setSaving(false);
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 block underline hover:text-gray-700"
      >
        区分を変更
      </button>
    );
  }

  return (
    <div className="mt-1 flex flex-col items-end gap-1">
      {USER_ROLES.map((r) => (
        <button
          key={r}
          type="button"
          disabled={saving}
          onClick={() => change(r)}
          className={`underline hover:text-gray-700 disabled:opacity-50 ${
            r === current ? "font-semibold text-gray-700" : ""
          }`}
        >
          {ROLE_LABELS[r]}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-gray-400 hover:text-gray-600"
      >
        閉じる
      </button>
    </div>
  );
}
