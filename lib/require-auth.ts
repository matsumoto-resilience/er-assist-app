import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// APIルート用のログイン確認。proxy.ts(clerkMiddleware)で既に保護しているが、
// Next.js認証ガイドの「データに近い層でも必ず確認する」方針に沿って各ルートでも確認する。
// 未ログインなら 401 レスポンスを返し、ログイン済みなら null を返す。
export async function requireUser(): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  }
  return null;
}
