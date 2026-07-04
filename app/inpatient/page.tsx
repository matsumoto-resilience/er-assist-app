"use client";

import { useEffect, useState } from "react";
import InpatientForm from "@/components/InpatientForm";
import InpatientResultPanel from "@/components/InpatientResultPanel";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import RoleGate from "@/components/RoleGate";
import HistoryPanel from "@/components/HistoryPanel";
import {
  addCaseHistoryEntry,
  clearCaseHistory,
  loadCaseHistory,
  removeCaseHistoryEntry,
  type CaseHistoryEntry,
} from "@/lib/case-history";
import { INPATIENT_DEPARTMENT_LABELS } from "@/lib/inpatient/types";
import type {
  InpatientInput,
  InpatientKnowledgeBaseEntry,
  InpatientOutput,
} from "@/lib/inpatient/types";
import type { UserRole } from "@/lib/types";

const ROLE_STORAGE_KEY = "erAssistUserRole";
const HISTORY_STORAGE_KEY = "erAssistInpatientCaseHistory";

type InpatientHistoryEntry = CaseHistoryEntry<
  InpatientInput,
  InpatientOutput,
  InpatientKnowledgeBaseEntry
>;

export default function InpatientPage() {
  const [output, setOutput] = useState<InpatientOutput | null>(null);
  const [lastInput, setLastInput] = useState<InpatientInput | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<InpatientKnowledgeBaseEntry[]>([]);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null | undefined>(undefined);
  const [history, setHistory] = useState<InpatientHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(ROLE_STORAGE_KEY);
    setRole(saved === "student" || saved === "doctor" ? saved : null);
    setHistory(loadCaseHistory(HISTORY_STORAGE_KEY));
  }, []);

  function selectRole(next: UserRole) {
    localStorage.setItem(ROLE_STORAGE_KEY, next);
    setRole(next);
  }

  async function handleSubmit(input: InpatientInput) {
    setLoading(true);
    setError(null);
    setOutput(null);
    setKnowledgeBase([]);
    setAuditId(null);
    const inputWithRole = { ...input, userRole: role ?? undefined };
    setLastInput(inputWithRole);

    try {
      const res = await fetch("/api/inpatient/generate", {
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
        addCaseHistoryEntry<InpatientInput, InpatientOutput, InpatientKnowledgeBaseEntry>(
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

  function viewHistoryEntry(entry: InpatientHistoryEntry) {
    setError(null);
    setLastInput(entry.input);
    setOutput(entry.output);
    setKnowledgeBase(entry.knowledgeBase);
    setAuditId(entry.auditId);
    setShowHistory(false);
  }

  if (role === undefined) {
    return null;
  }

  if (role === null) {
    return <RoleGate onSelect={selectRole} />;
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">入院 臨床意思決定支援</h1>
          <p className="mt-1 text-sm text-gray-600">
            入院時診断・経過から、科別の内科的治療方針の参考情報を生成します(循環器内科・呼吸器内科・消化器内科)。
          </p>
        </div>
        <div className="shrink-0 text-right text-xs text-gray-500">
          <span className="rounded-full bg-gray-100 px-2 py-1 font-medium text-gray-700">
            {role === "student" ? "学生モード" : "医師モード"}
          </span>
          <button
            type="button"
            onClick={() => setRole(null)}
            className="mt-1 block underline hover:text-gray-700"
          >
            切り替える
          </button>
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
          getLabel={(entry) =>
            `${INPATIENT_DEPARTMENT_LABELS[entry.input.department]} / ${entry.input.admissionDiagnosis}`
          }
          onSelect={viewHistoryEntry}
          onRemove={(id) =>
            setHistory(
              removeCaseHistoryEntry<
                InpatientInput,
                InpatientOutput,
                InpatientKnowledgeBaseEntry
              >(HISTORY_STORAGE_KEY, id)
            )
          }
          onClear={() => setHistory(clearCaseHistory(HISTORY_STORAGE_KEY))}
        />
      )}

      <div className="mb-6">
        <DisclaimerBanner />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <InpatientForm onSubmit={handleSubmit} loading={loading} />
        </div>

        <div>
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {!error && !output && !loading && (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
              入院患者情報を入力し「治療方針を生成する」を押してください
            </div>
          )}
          {loading && (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              AIが現状評価・治療方針を検討しています...
            </div>
          )}
          {output && lastInput && (
            <InpatientResultPanel
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
