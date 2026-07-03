import { NextRequest, NextResponse } from "next/server";
import { constantTimeStringEqual, verifyPassword } from "@/lib/password-hash";

// アプリ全体を共通ユーザー名・パスワードで保護するBasic認証。
// パスワードはPBKDF2ハッシュ(APP_ACCESS_PASSWORD_HASH)として保存し、平文は保持しない。
// npm run hash-password -- "パスワード" でハッシュを生成できる。
// APP_ACCESS_USERNAME / APP_ACCESS_PASSWORD_HASH が未設定の場合は認証をスキップする(ローカル初期開発向け)。
// 本番/共有環境にデプロイする前には必ず環境変数を設定すること。
const REALM = 'Basic realm="ER Assist", charset="UTF-8"';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const expectedUsername = process.env.APP_ACCESS_USERNAME;
  const passwordHash = process.env.APP_ACCESS_PASSWORD_HASH;

  if (!expectedUsername || !passwordHash) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const credentials = parseBasicAuthCredentials(authHeader);
    if (
      credentials !== null &&
      constantTimeStringEqual(credentials.username, expectedUsername) &&
      (await verifyPassword(credentials.password, passwordHash))
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse("認証が必要です。", {
    status: 401,
    headers: { "WWW-Authenticate": REALM },
  });
}

function parseBasicAuthCredentials(
  authHeader: string
): { username: string; password: string } | null {
  if (!authHeader.startsWith("Basic ")) return null;
  try {
    const decoded = atob(authHeader.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex < 0) return null;
    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

export const config = {
  // 静的アセット(_next/static, _next/image, favicon)以外の全リクエストを保護対象にする
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
