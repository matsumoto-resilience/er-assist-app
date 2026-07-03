import path from "path";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// 開発時はNext.jsのHMR(WebSocket接続・インラインスクリプト)を妨げないよう
// 緩めのCSPにし、本番のみ厳格なCSPを適用する。
const contentSecurityPolicy = isProd
  ? [
      "default-src 'self'",
      // Next.jsはハイドレーション用データをインラインscriptで埋め込むため、
      // nonceを使わない静的CSP構成ではscript-srcにも'unsafe-inline'が必要
      // (公式ドキュメント node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md の
      // "Without Nonces" 参照)。これが無いとハイドレーションが全て失敗し、
      // フォームがJSで一切反応しなくなる。
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  : [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'none'",
    ].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
