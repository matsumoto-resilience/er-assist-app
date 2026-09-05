"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import PatientForm from "@/components/PatientForm";
import ResultPanel from "@/components/ResultPanel";
import RoleSwitcher from "@/components/RoleSwitcher";
import HistoryPanel from "@/components/HistoryPanel";
import { ROLE_LABELS, isUserRole } from "@/lib/roles";
import {
  addCaseHistoryEntry,
  clearCaseHistory,
  loadCaseHistory,
  removeCaseHistoryEntry,
  type CaseHistoryEntry,
} from "@/lib/case-history";
import type {
  AssistOutput,
  KnowledgeBaseEntry,
  PatientInput,
  UserRole,
} from "@/lib/types";

const HISTORY_STORAGE_KEY = "erAssistCaseHistory";

type ErHistoryEntry = CaseHistoryEntry<PatientInput, AssistOutput, KnowledgeBaseEntry>;

export default function Home() {
  const [output, setOutput] = useState<AssistOutput | null>(null);
  const [lastInput, setLastInput] = useState<PatientInput | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseEntry[]>([]);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ErHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { user, isLoaded } = useUser();
  const role: UserRole = isUserRole(user?.unsafeMetadata?.role)
    ? user.unsafeMetadata.role
    : "doctor";

  useEffect(() => {
    setHistory(loadCaseHistory(HISTORY_STORAGE_KEY));
  }, []);

  async function handleSubmit(input: PatientInput) {
    setLoading(true);
    setError(null);
    setOutput(null);
    setKnowledgeBase([]);
    setAuditId(null);
    const inputWithRole = { ...input, userRole: role };
    setLastInput(inputWithRole);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputWithRole),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "生成に失敗しました。");
        return;
      }

      setOutput(data.output);
      setKnowledgeBase(data.knowledgeBase ?? []);
      setAuditId(data.auditId ?? null);
      setHistory(
        addCaseHistoryEntry<PatientInput, AssistOutput, KnowledgeBaseEntry>(
          HISTORY_STORAGE_KEY,
          {
            input: inputWithRole,
            output: data.output,
            knowledgeBase: data.knowledgeBase ?? [],
            auditId: data.auditId ?? null,
          }
        )
      );
    } catch {
      setError("通信エラーが発生しました。ネットワーク接続を確認してください。");
    } finally {
      setLoading(false);
    }
  }

  function viewHistoryEntry(entry: ErHistoryEntry) {
    setError(null);
    setLastInput(entry.input);
    setOutput(entry.output);
    setKnowledgeBase(entry.knowledgeBase);
    setAuditId(entry.auditId);
    setShowHistory(false);
  }

  if (!isLoaded) {
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ER Assist — 救急外来 臨床意思決定支援
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            主訴と患者情報から、診療方針・鑑別疾患・治療方針の参考情報を生成します。
          </p>
        </div>
        <div className="shrink-0 text-right text-xs text-gray-500">
          <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700">
            {ROLE_LABELS[role]}モード
          </span>
          <RoleSwitcher current={role} />
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className="mt-1 block underline hover:text-gray-700"
          >
            履歴を{showHistory ? "隠す" : "見る"}({history.length})
          </button>
        </div>
      </header>

      {showHistory && (
        <HistoryPanel
          entries={history}
          getLabel={(entry) => entry.input.chiefComplaint}
          onSelect={viewHistoryEntry}
          onRemove={(id) =>
            setHistory(
              removeCaseHistoryEntry<PatientInput, AssistOutput, KnowledgeBaseEntry>(
                HISTORY_STORAGE_KEY,
                id
              )
            )
          }
          onClear={() => setHistory(clearCaseHistory(HISTORY_STORAGE_KEY))}
        />
      )}

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
          {output && lastInput && (
            <ResultPanel
              output={output}
              input={lastInput}
              knowledgeBase={knowledgeBase}
              auditId={auditId}
            />
          )}
        </div>
      </div>
    </main>
  );
}
