"use client";

import { useEffect, useRef, useState } from "react";
import DialPicker from "@/components/DialPicker";
import type { PatientInput } from "@/lib/types";

interface Props {
  onSubmit: (input: PatientInput) => void;
  loading: boolean;
}

const DRAFT_STORAGE_KEY = "erAssistDraftInput";

// バイタル未変更時の初期値(正常値)。入力の手間を減らすため、異常値のみ変更してもらう想定。
const NORMAL_VITALS: PatientInput["vitals"] = {
  systolicBP: 120,
  diastolicBP: 80,
  heartRate: 75,
  respiratoryRate: 16,
  spo2: 98,
  bodyTemp: 36.5,
  gcs: 15,
};

const emptyInput: PatientInput = {
  chiefComplaint: "",
  freeText: "",
  focusQuestion: "",
  age: undefined,
  sex: "unknown",
  vitals: { ...NORMAL_VITALS },
};

function loadInitialInput(): PatientInput {
  if (typeof window === "undefined") return emptyInput;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return emptyInput;
    const parsed = JSON.parse(raw);
    return {
      ...emptyInput,
      ...parsed,
      vitals: { ...NORMAL_VITALS, ...parsed.vitals },
    };
  } catch {
    return emptyInput;
  }
}

export default function PatientForm({ onSubmit, loading }: Props) {
  const [input, setInput] = useState<PatientInput>(loadInitialInput);
  const [chiefComplaintError, setChiefComplaintError] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const chiefComplaintRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(input));
  }, [input]);

  function handleReset() {
    if (!confirm("入力内容をリセットしますか?")) return;
    setInput({ ...emptyInput, vitals: { ...NORMAL_VITALS } });
    setChiefComplaintError(false);
    setResetCount((n) => n + 1); // バイタルのダイヤル表示を正常値に戻すため再マウントさせる
  }

  function updateVital(key: keyof PatientInput["vitals"], value: string) {
    setInput((prev) => ({
      ...prev,
      vitals: {
        ...prev.vitals,
        [key]: value === "" ? undefined : Number(value),
      },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.chiefComplaint.trim()) {
      setChiefComplaintError(true);
      chiefComplaintRef.current?.focus();
      return;
    }
    setChiefComplaintError(false);
    onSubmit(input);
  }

  function handleFormKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    // 一行入力欄でのEnter(IME変換確定・次項目への移動を含む)は、
    // ブラウザ標準のフォーム自動送信を引き起こすため、
    // ボタンクリックによる明示的な送信のみを許可する。
    if (e.key === "Enter" && target.tagName !== "TEXTAREA" && target.tagName !== "BUTTON") {
      e.preventDefault();
    }
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          主訴 <span className="text-red-600">*</span>
        </label>
        <input
          ref={chiefComplaintRef}
          type="text"
          value={input.chiefComplaint}
          onChange={(e) => {
            setInput((prev) => ({ ...prev, chiefComplaint: e.target.value }));
            if (chiefComplaintError && e.target.value.trim()) {
              setChiefComplaintError(false);
            }
          }}
          placeholder="例: 胸痛"
          aria-invalid={chiefComplaintError}
          className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
            chiefComplaintError
              ? "border-red-400 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          }`}
        />
        {chiefComplaintError && (
          <p className="mt-1 text-xs text-red-600">主訴を入力してください。</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">年齢</label>
          <input
            type="number"
            min={0}
            max={120}
            value={input.age ?? ""}
            onChange={(e) =>
              setInput((prev) => ({
                ...prev,
                age: e.target.value === "" ? undefined : Number(e.target.value),
              }))
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">性別</label>
          <select
            value={input.sex}
            onChange={(e) =>
              setInput((prev) => ({
                ...prev,
                sex: e.target.value as PatientInput["sex"],
              }))
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="unknown">不明</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          現病歴・既往歴など(フリーテキスト)
        </label>
        <textarea
          rows={5}
          value={input.freeText}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, freeText: e.target.value }))
          }
          placeholder="例: 3時間前から持続する前胸部の圧迫感。冷汗あり。高血圧・糖尿病の既往。喫煙歴あり。"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          特に確認したいポイント(任意)
        </label>
        <input
          type="text"
          value={input.focusQuestion}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, focusQuestion: e.target.value }))
          }
          placeholder="例: 帰宅可能か入院が必要か知りたい"
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          知りたい点を絞ると、より早く要点を絞った回答が得られます。
        </p>
      </div>

      <fieldset className="rounded-md border border-gray-200 p-4">
        <legend className="px-1 text-sm font-medium text-gray-700">
          バイタルサイン(任意)
        </legend>
        <p className="mb-3 text-xs text-gray-500">
          指でスクロールして値を選択してください。初期値は正常値です。異常があれば変更してください(「-」で未測定に戻せます)。
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DialPicker
            key={`systolicBP-${resetCount}`}
            label="収縮期血圧 (mmHg)"
            min={40}
            max={260}
            step={2}
            defaultValue={input.vitals.systolicBP}
            onChange={(v) => updateVital("systolicBP", v)}
          />
          <DialPicker
            key={`diastolicBP-${resetCount}`}
            label="拡張期血圧 (mmHg)"
            min={20}
            max={160}
            step={2}
            defaultValue={input.vitals.diastolicBP}
            onChange={(v) => updateVital("diastolicBP", v)}
          />
          <DialPicker
            key={`heartRate-${resetCount}`}
            label="心拍数 (/分)"
            min={20}
            max={250}
            step={1}
            defaultValue={input.vitals.heartRate}
            onChange={(v) => updateVital("heartRate", v)}
          />
          <DialPicker
            key={`respiratoryRate-${resetCount}`}
            label="呼吸数 (/分)"
            min={5}
            max={60}
            step={1}
            defaultValue={input.vitals.respiratoryRate}
            onChange={(v) => updateVital("respiratoryRate", v)}
          />
          <DialPicker
            key={`spo2-${resetCount}`}
            label="SpO2 (%)"
            min={50}
            max={100}
            step={1}
            defaultValue={input.vitals.spo2}
            onChange={(v) => updateVital("spo2", v)}
          />
          <DialPicker
            key={`bodyTemp-${resetCount}`}
            label="体温 (℃)"
            min={30}
            max={42}
            step={0.1}
            defaultValue={input.vitals.bodyTemp}
            onChange={(v) => updateVital("bodyTemp", v)}
          />
          <DialPicker
            key={`gcs-${resetCount}`}
            label="GCS"
            min={3}
            max={15}
            step={1}
            defaultValue={input.vitals.gcs}
            onChange={(v) => updateVital("gcs", v)}
          />
        </div>
      </fieldset>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading ? "生成中..." : "診療方針を生成する"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="shrink-0 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          リセット
        </button>
      </div>
    </form>
  );
}
