import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Next.js 16 では Middleware は Proxy に改称された(node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md)。
// Clerk も Next 16 では proxy.ts に clerkMiddleware() を配置する。
//
// アプリ全体をログイン必須にし、未ログインは新規登録(/sign-up)へ誘導する。
// /sign-in・/sign-up・/privacy(App Store審査で必要)のみ公開。

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect({
        unauthenticatedUrl: new URL("/sign-up", req.url).toString(),
      });
    }
  },
  {
    // Clerk互換のCSPを自動生成し、Frontend APIのホストも自動で connect-src に追加する。
    // (以前は next.config.ts で CSP を設定していたが、Clerkのウィジェットと両立しないため
    //  CSPの管理はここへ一本化した。frame-ancestors 等の独自方針はここで上書きする。)
    contentSecurityPolicy: {
      directives: {
        "frame-ancestors": ["'none'"],
        "base-uri": ["'self'"],
        "img-src": ["data:"],
        "font-src": ["'self'"],
        // 開発時の Turbopack HMR(WebSocket)用。本番でも無害。
        "connect-src": ["ws:", "wss:"],
      },
    },
  }
);

export const config = {
  matcher: [
    // Next内部と静的ファイルを除く全リクエスト(クエリ内の拡張子は除外しない)
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|webmanifest)).*)",
    // APIルートは常に実行
    "/(api)(.*)",
    // Clerk Frontend API のプロキシパス
    "/__clerk/(.*)",
  ],
};
