import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.resij.erassist",
  appName: "ER Assist",
  webDir: "www",
  ios: {
    contentInset: "always",
  },
  server: {
    // 起動時はローカルのwww/index.html(ペイウォールゲート)を表示する。
    // サブスク有効を確認できた場合のみ、そこからJSでVercel本番URLへ遷移する。
    allowNavigation: ["er-assist-app.vercel.app"],
  },
};

export default config;
