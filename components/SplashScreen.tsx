"use client";

import { useEffect, useState } from "react";

// 表示を保持する時間(全テキストが出そろってから読み終えるまでの余裕)
const HOLD_MS = 5200;
// フェードアウトにかける時間
const FADE_MS = 700;

export default function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "fading" | "done">("visible");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), HOLD_MS);
    const doneTimer = setTimeout(() => setPhase("done"), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      onClick={() => setPhase("fading")}
      aria-hidden={phase === "fading"}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-8 transition-opacity"
      style={{
        background: "#0a5eb0",
        opacity: phase === "fading" ? 0 : 1,
        pointerEvents: phase === "fading" ? "none" : "auto",
        transitionDuration: `${FADE_MS}ms`,
      }}
    >
      <div className="flex flex-col items-center">
        <span
          data-text="ER"
          className="splash-glow splash-shine font-bold leading-none text-white"
          style={{
            fontSize: "clamp(4rem, 24vw, 9.5rem)",
            letterSpacing: "-0.02em",
            animationDelay: "0.2s",
          }}
        >
          ER
        </span>
        <span
          data-text="ASSISTANT"
          className="splash-glow splash-shine font-semibold text-white"
          style={{
            fontSize: "clamp(1.4rem, 7.5vw, 2.75rem)",
            letterSpacing: "0.16em",
            animationDelay: "0.75s",
          }}
        >
          ASSISTANT
        </span>
      </div>

      <div
        className="splash-frame mt-10 w-full max-w-md rounded-2xl border px-5 py-4 text-left"
        style={{
          borderColor: "rgba(255, 255, 255, 0.6)",
          background: "rgba(255, 255, 255, 0.12)",
          animationDelay: "1.3s",
        }}
      >
        <p
          className="splash-glow text-sm font-semibold leading-relaxed text-white"
          style={{ animationDelay: "1.7s" }}
        >
          本ツールは臨床意思決定を支援する参考情報を提供するものであり、診断・治療を確定するものではありません。
        </p>
        <p
          className="splash-glow mt-2 text-sm leading-relaxed text-white/90"
          style={{ animationDelay: "2.15s" }}
        >
          出力内容は必ず指導医・担当医が確認し、最終的な診断・治療方針は医師の責任において決定してください。本ツールは医療機器として承認されたものではありません。
        </p>
      </div>
    </div>
  );
}
