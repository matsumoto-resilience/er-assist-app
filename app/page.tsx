"use client";

import { useState } from "react";
import PatientForm from "@/components/PatientForm";
import ResultPanel from "@/components/ResultPanel";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import type { AssistOutput, PatientInput } from "@/lib/types";

export default function Home() {
  const [output, setOutput] = useState<AssistOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: PatientInput) {
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "生成に失敗しました。");
        return;
      }

      setOutput(data.output);
    } catch {
      setError("通信エラーが発生しました。ネットワーク接続を確認してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          ER Assist — 救急外来 臨床意思決定支援
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          主訴と患者情報から、診療方針・鑑別疾患・治療方針の参考情報を生成します。
        </p>
      </header>

      <div className="mb-6">
        <DisclaimerBanner />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <PatientForm onSubmit={handleSubmit} loading={loading} />
        </div>

        <div>
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {!error && !output && !loading && (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
              患者情報を入力し「診療方針を生成する」を押してください
            </div>
          )}
          {loading && (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              AIが診療方針・鑑別疾患・治療方針を検討しています...
            </div>
          )}
          {output && <ResultPanel output={output} />}
        </div>
      </div>
    </main>
  );
}
