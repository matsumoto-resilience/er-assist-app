import type { ReactNode } from "react";

// サインイン/サインアップ画面の共通シェル。スプラッシュ(components/SplashScreen.tsx /
// www/index.html)と同じ青系デザイン。globals.css の .splash-glow / .splash-frame を再利用。
export default function AuthShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-y-auto px-6 py-10"
      style={{ background: "#0a5eb0" }}
    >
      <div className="flex flex-col items-center">
        <span
          className="splash-glow font-bold leading-none text-white"
          style={{ fontSize: "clamp(3rem, 16vw, 5rem)", animationDelay: "0.1s" }}
        >
          ER
        </span>
        <span
          className="splash-glow font-semibold text-white"
          style={{
            fontSize: "clamp(1rem, 5vw, 1.5rem)",
            letterSpacing: "0.16em",
            animationDelay: "0.45s",
          }}
        >
          ASSISTANT
        </span>
      </div>

      <div
        className="splash-frame mt-8 w-full max-w-sm rounded-2xl border px-6 py-6"
        style={{
          borderColor: "rgba(255, 255, 255, 0.6)",
          background: "rgba(255, 255, 255, 0.12)",
          animationDelay: "0.9s",
        }}
      >
        <h1 className="mb-5 text-center text-lg font-bold text-white">{title}</h1>
        {children}
      </div>
    </div>
  );
}
