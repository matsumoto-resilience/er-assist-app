"use client";

import { useLayoutEffect, useRef, useState } from "react";

const ROW_HEIGHT = 32; // px, matches Tailwind h-8 / top-8

function buildOptionLabels(min: number, max: number, step: number): string[] {
  const decimals = String(step).split(".")[1]?.length ?? 0;
  const factor = 10 ** decimals;
  const count = Math.round((max - min) / step);
  return Array.from({ length: count + 1 }, (_, i) =>
    (Math.round((min + i * step) * factor) / factor).toFixed(decimals)
  );
}

function indexForValue(
  value: number | undefined,
  min: number,
  step: number,
  optionsLength: number
): number {
  if (value == null) return 0;
  const idx = 1 + Math.round((value - min) / step);
  return Math.max(0, Math.min(optionsLength - 1, idx));
}

export default function DialPicker({
  label,
  min,
  max,
  step,
  defaultValue,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue?: number;
  onChange: (value: string) => void;
}) {
  const values = ["-", ...buildOptionLabels(min, max, step)];
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(() =>
    indexForValue(defaultValue, min, step, values.length)
  );

  // 初期表示位置をマウント前(ペイント前)に合わせ、"-"から正常値へ飛ぶ見た目のチラつきを防ぐ
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = selectedIndex * ROW_HEIGHT;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commitIndex(index: number) {
    const clamped = Math.max(0, Math.min(values.length - 1, index));
    setSelectedIndex(clamped);
    onChange(clamped === 0 ? "" : values[clamped]);
  }

  function handleScroll() {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = containerRef.current;
      if (!el) return;
      commitIndex(Math.round(el.scrollTop / ROW_HEIGHT));
    });
  }

  function scrollToIndex(index: number) {
    containerRef.current?.scrollTo({ top: index * ROW_HEIGHT, behavior: "smooth" });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      scrollToIndex(Math.max(0, selectedIndex - 1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      scrollToIndex(Math.min(values.length - 1, selectedIndex + 1));
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <div className="relative mt-1">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="listbox"
          aria-label={label}
          className="h-24 overflow-y-scroll rounded-md border border-gray-300 bg-white text-center [scrollbar-width:none] focus:outline-none focus:ring-1 focus:ring-blue-500 [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "y mandatory" }}
        >
          <div style={{ height: ROW_HEIGHT }} aria-hidden />
          {values.map((v, i) => (
            <div
              key={i}
              role="option"
              aria-selected={i === selectedIndex}
              onClick={() => scrollToIndex(i)}
              className={`flex cursor-pointer items-center justify-center text-sm ${
                i === selectedIndex ? "font-bold text-blue-700" : "text-gray-400"
              }`}
              style={{ height: ROW_HEIGHT, scrollSnapAlign: "center" }}
            >
              {v}
            </div>
          ))}
          <div style={{ height: ROW_HEIGHT }} aria-hidden />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-8 h-8 border-y-2 border-blue-400" />
      </div>
    </div>
  );
}
