"use client";

import { useState } from "react";

export default function CaseFeedback({ auditId }: { auditId: string | null }) {
  const [rating, setRating] = useState<"helpful" | "not_helpful" | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  if (!auditId) return null;

  async function submit() {
    if (!rating) return;
    setSending(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId, rating, comment }),
      });
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <section className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        フィードバックありがとうございました。振り返りに活用させていただきます。
      </section>
    );
  }

  return (
    <section className="rounded-md border border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-bold text-gray-900">振り返り: この提案は参考になりましたか?</h3>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => setRating("helpful")}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            rating === "helpful"
              ? "border-blue-400 bg-blue-100 text-blue-900"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          👍 参考になった
        </button>
        <button
          type="button"
          onClick={() => setRating("not_helpful")}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            rating === "not_helpful"
              ? "border-red-400 bg-red-100 text-red-900"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          👎 改善してほしい
        </button>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="コメント(任意): 良かった点・分かりにくかった点など"
        rows={2}
        className="mt-2 w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="button"
        disabled={!rating || sending}
        onClick={submit}
        className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        送信
      </button>
    </section>
  );
}
