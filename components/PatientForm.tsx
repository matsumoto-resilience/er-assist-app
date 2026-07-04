"use client";

import { useRef, useState } from "react";
import type { PatientInput } from "@/lib/types";

interface Props {
  onSubmit: (input: PatientInput) => void;
  loading: boolean;
}

const emptyInput: PatientInput = {
  chiefComplaint: "",
  freeText: "",
  focusQuestion: "",
  age: undefined,
  sex: "unknown",
  vitals: {},
};

export default function PatientForm({ onSubmit, loading }: Props) {
  const [input, setInput] = useState<PatientInput>(emptyInput);
  const [chiefComplaintError, setChiefComplaintError] = useState(false);
  const chiefComplaintRef = useRef<HTMLInputElement>(null);

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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <VitalField
            label="収縮期血圧 (mmHg)"
            step={5}
            onChange={(v) => updateVital("systolicBP", v)}
          />
          <VitalField
            label="拡張期血圧 (mmHg)"
            step={5}
            onChange={(v) => updateVital("diastolicBP", v)}
          />
          <VitalField
            label="心拍数 (/分)"
            step={5}
            onChange={(v) => updateVital("heartRate", v)}
          />
          <VitalField
            label="呼吸数 (/分)"
            step={1}
            onChange={(v) => updateVital("respiratoryRate", v)}
          />
          <VitalField
            label="SpO2 (%)"
            step={1}
            onChange={(v) => updateVital("spo2", v)}
          />
          <VitalField
            label="体温 (℃)"
            step={0.1}
            onChange={(v) => updateVital("bodyTemp", v)}
          />
          <VitalField label="GCS" step={1} onChange={(v) => updateVital("gcs", v)} />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {loading ? "生成中..." : "診療方針を生成する"}
      </button>
    </form>
  );
}

function VitalField({
  label,
  step,
  onChange,
}: {
  label: string;
  step: number;
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  function commit(next: string) {
    setValue(next);
    onChange(next);
  }

  function adjust(delta: number) {
    const current = value === "" ? 0 : Number(value);
    const decimals = String(step).split(".")[1]?.length ?? 0;
    const next = (current + delta).toFixed(decimals);
    commit(next);
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <div className="mt-1 flex items-stretch overflow-hidden rounded-md border border-gray-300 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <button
          type="button"
          onClick={() => adjust(-step)}
          aria-label={`${label}を減らす`}
          className="w-8 shrink-0 text-lg leading-none text-gray-500 hover:bg-gray-100 active:bg-gray-200"
        >
          −
        </button>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => commit(e.target.value)}
          className="w-full border-0 bg-transparent px-1 py-1.5 text-center text-sm text-gray-900 focus:outline-none focus:ring-0"
        />
        <button
          type="button"
          onClick={() => adjust(step)}
          aria-label={`${label}を増やす`}
          className="w-8 shrink-0 text-lg leading-none text-gray-500 hover:bg-gray-100 active:bg-gray-200"
        >
          +
        </button>
      </div>
    </div>
  );
}
