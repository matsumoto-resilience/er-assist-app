"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";
import { USER_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/roles";
import type { UserRole } from "@/lib/types";

// このClerk(@clerk/nextjs v7系)では useSignUp は「Future」シグナルAPIを返す。
//  - { signUp, errors, fetchStatus } を返す(旧 isLoaded / setActive は無い)
//  - signUp.create({...}) でサインアップを開始し、戻り値の { error } を確認する
//  - メール確認は signUp.verifications.sendEmailCode() / verifyEmailCode({ code })
//  - 完了後は signUp.finalize() でセッションを有効化する(旧 setActive の置き換え)

const inputClass =
  "w-full rounded-md border border-white/50 bg-white/90 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-white focus:bg-white";

export default function SignUpPage() {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("doctor");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: createError } = await signUp.create({
        emailAddress: email,
        password,
        unsafeMetadata: { role },
      });
      if (createError) {
        setError(
          createError.longMessage ??
            createError.message ??
            "登録に失敗しました。入力内容をご確認ください。"
        );
        return;
      }
      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setError(
          sendError.longMessage ??
            sendError.message ??
            "確認コードの送信に失敗しました。"
        );
        return;
      }
      setStep("verify");
    } catch {
      setError("通信エラーが発生しました。しばらくして再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({
        code,
      });
      if (verifyError) {
        setError(
          verifyError.longMessage ??
            verifyError.message ??
            "確認コードが正しくありません。"
        );
        return;
      }
      if (signUp.status === "complete") {
        await signUp.finalize({ navigate: () => router.push("/") });
        return;
      }
      setError("確認が完了しませんでした。コードをご確認ください。");
    } catch {
      setError("通信エラーが発生しました。しばらくして再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title={step === "form" ? "アカウント登録" : "メールアドレスの確認"}>
      {step === "form" ? (
        <form onSubmit={handleCreate} className="space-y-4">
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
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="8文字以上"
            />
          </div>

          <fieldset>
            <legend className="mb-1 block text-xs font-medium text-white/90">
              区分
            </legend>
            <div className="space-y-2">
              {USER_ROLES.map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-left transition ${
                    role === r
                      ? "border-white bg-white/20"
                      : "border-white/40 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {ROLE_LABELS[r]}
                    </span>
                    <span className="block text-xs text-white/80">
                      {ROLE_DESCRIPTIONS[r]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="text-sm text-red-100">{error}</p>}

          {/* Clerk のボット対策(必要時のみ表示される) */}
          <div id="clerk-captcha" />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-white px-4 py-2.5 text-sm font-bold text-[#0a5eb0] transition hover:bg-white/90 disabled:opacity-50"
          >
            {submitting ? "処理中..." : "登録する"}
          </button>

          <p className="text-center text-xs text-white/80">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/sign-in" className="font-semibold underline">
              ログイン
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <p className="text-sm text-white/90">
            {email} に確認コードを送信しました。メールに記載の6桁のコードを入力してください。
          </p>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inputClass}
            placeholder="確認コード"
          />

          {error && <p className="text-sm text-red-100">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-white px-4 py-2.5 text-sm font-bold text-[#0a5eb0] transition hover:bg-white/90 disabled:opacity-50"
          >
            {submitting ? "確認中..." : "確認して登録完了"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("form");
              setError(null);
              setCode("");
            }}
            className="w-full text-center text-xs text-white/80 underline"
          >
            入力内容を修正する
          </button>
        </form>
      )}
    </AuthShell>
  );
}
