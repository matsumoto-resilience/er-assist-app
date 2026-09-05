"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

// このClerk(@clerk/nextjs v7系)では useSignIn は「Future」シグナルAPIを返す。
//  - { signIn, errors, fetchStatus } を返す(旧 isLoaded / setActive は無い)
//  - signIn.password({...}) 等のファクター別メソッドを呼び、戻り値の { error } を確認する
//  - 完了後は signIn.finalize() でセッションを有効化する(旧 setActive の置き換え)

const inputClass =
  "w-full rounded-md border border-white/50 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-white focus:bg-white";

export default function SignInPage() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: pwError } = await signIn.password({
        identifier: email,
        password,
      });
      if (pwError) {
        setError(
          pwError.longMessage ??
            pwError.message ??
            "メールアドレスまたはパスワードが正しくありません。"
        );
        return;
      }
      if (signIn.status === "complete") {
        await signIn.finalize({ navigate: () => router.push("/") });
        return;
      }
      setError("ログインを完了できませんでした。");
    } catch {
      setError("通信エラーが発生しました。しばらくして再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="ログイン">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-white/90">
            メールアドレス
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-white/90">
            パスワード
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-100">{error}</p>}

        <div id="clerk-captcha" />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-white px-4 py-2.5 text-sm font-bold text-[#0a5eb0] transition hover:bg-white/90 disabled:opacity-50"
        >
          {submitting ? "処理中..." : "ログイン"}
        </button>

        <p className="text-center text-xs text-white/80">
          アカウントをお持ちでない方は{" "}
          <Link href="/sign-up" className="font-semibold underline">
            新規登録
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
