"use client";

import type { UserRole } from "@/lib/types";

export default function RoleGate({
  onSelect,
}: {
  onSelect: (role: UserRole) => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-1 flex-col items-center justify-center px-4">
      <h1 className="text-xl font-bold text-gray-900">ご利用の区分を選択してください</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        区分に応じて解説の詳しさを調整します。この端末に保存され、後から変更できます。
      </p>
      <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect("student")}
          className="rounded-lg border border-gray-300 bg-white p-5 text-left shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
        >
          <span className="block text-base font-semibold text-gray-900">学生として利用</span>
          <span className="mt-1 block text-xs text-gray-600">
            学習目的。臨床推論の考え方を厚めに解説します。
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelect("doctor")}
          className="rounded-lg border border-gray-300 bg-white p-5 text-left shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
        >
          <span className="block text-base font-semibold text-gray-900">医師として利用</span>
          <span className="mt-1 block text-xs text-gray-600">
            実臨床の参考目的。要点を簡潔にまとめます。
          </span>
        </button>
      </div>
    </div>
  );
}
