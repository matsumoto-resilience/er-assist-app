"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AiTopicResultPanel from "@/components/AiTopicResultPanel";
import {
  OUTPATIENT_CATEGORY_GROUP_LABELS,
  OUTPATIENT_CATEGORY_LABELS,
} from "@/lib/outpatient/types";
import { getAllOutpatientSymptomGuides } from "@/lib/outpatient/retrieve";
import {
  addSearchHistory,
  clearSearchHistory,
  loadSearchHistory,
} from "@/lib/outpatient/search-history";
import type {
  OutpatientAiTopicResult,
  OutpatientCategoryGroup,
  OutpatientSymptomGuide,
} from "@/lib/outpatient/types";

const guides = getAllOutpatientSymptomGuides();
const GROUP_ORDER: OutpatientCategoryGroup[] = ["symptom", "chronic"];

export default function OutpatientPage() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<OutpatientAiTopicResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadSearchHistory());
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredGuides = guides.filter((guide) =>
    guide.categoryLabel.toLowerCase().includes(normalizedQuery)
  );
  const noMatch = normalizedQuery !== "" && filteredGuides.length === 0;

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setHistory(addSearchHistory(query));
  }

  function selectHistoryItem(item: string) {
    setQuery(item);
    setAiResult(null);
    setAiError(null);
  }

  async function handleGenerateTopic() {
    const topic = query.trim();
    if (!topic) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    setHistory(addSearchHistory(topic));

    try {
      const res = await fetch("/api/outpatient/generate-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? "生成に失敗しました。");
        return;
      }
      setAiResult(data.output);
    } catch {
      setAiError("通信エラーが発生しました。ネットワーク接続を確認してください。");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">外来 薬剤選択ガイド</h1>
        <p className="mt-1 text-sm text-gray-600">
          一般外来でよく管理する症状・慢性疾患について、症状ごとに薬剤選択の考え方・各薬の効果・副作用をまとめた学習用リファレンスです。一覧から選ぶか、症状名で検索してください。
        </p>
      </header>

      <form onSubmit={handleSearchSubmit} className="mb-3">
        <label className="block text-sm font-medium text-gray-700">症状を検索</label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setAiResult(null);
              setAiError(null);
            }}
            placeholder="例: 高血圧、感冒、不眠..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            検索
          </button>
        </div>
      </form>

      {history.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500">最近の検索:</span>
          {history.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectHistoryItem(item)}
              className="rounded-full border border-gray-300 bg-white px-2.5 py-1 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setHistory(clearSearchHistory())}
            className="text-gray-400 underline hover:text-gray-600"
          >
            履歴を消す
          </button>
        </div>
      )}

      <div className="space-y-6">
        {GROUP_ORDER.map((group) => {
          const groupGuides = filteredGuides.filter((guide) => guide.group === group);
          if (groupGuides.length === 0) return null;
          return (
            <div key={group}>
              <h2 className="mb-2 text-sm font-bold text-gray-500">
                {OUTPATIENT_CATEGORY_GROUP_LABELS[group]}
              </h2>
              <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white">
                {groupGuides.map((guide) => (
                  <CategoryListRow key={guide.category} guide={guide} />
                ))}
              </div>
            </div>
          );
        })}

        {noMatch && (
          <div className="rounded-lg border border-dashed border-purple-300 bg-purple-50 p-4 text-center">
            <p className="text-sm text-purple-900">
              「{query.trim()}」は現在の一覧にありません。
            </p>
            <button
              type="button"
              onClick={handleGenerateTopic}
              disabled={aiLoading}
              className="mt-3 rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {aiLoading ? "生成中..." : "AIに生成してもらう"}
            </button>
            {aiError && <p className="mt-2 text-xs text-red-700">{aiError}</p>}
          </div>
        )}
      </div>

      {aiResult && (
        <div className="mt-6">
          <AiTopicResultPanel result={aiResult} />
        </div>
      )}

      {!aiResult && !noMatch && (
        <div className="mt-6 flex items-center justify-center rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
          症状をタップすると、詳細ページに移動します
        </div>
      )}
    </main>
  );
}

function CategoryListRow({ guide }: { guide: OutpatientSymptomGuide }) {
  return (
    <Link
      href={`/outpatient/${guide.category}`}
      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition bg-white hover:bg-gray-50"
    >
      <span className="font-semibold text-gray-900">
        {OUTPATIENT_CATEGORY_LABELS[guide.category]}
      </span>
      <span className="text-xs text-gray-400">詳しく見る →</span>
    </Link>
  );
}
