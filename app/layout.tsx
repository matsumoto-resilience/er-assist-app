import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import ModuleNav from "@/components/ModuleNav";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ER Assist — 救急外来 臨床意思決定支援",
  description: "研修医・レジデント向け 診療方針・鑑別疾患・治療方針の生成支援ツール(参考情報)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <ClerkProvider>
          <SplashScreen />
          <ModuleNav />
          <div className="flex-1 flex flex-col">{children}</div>
          <footer className="border-t border-gray-200 bg-white px-4 py-3 text-center text-xs text-gray-500">
            本アプリは医療従事者向けの臨床意思決定<strong>支援ツール</strong>です。診断・治療方針を確定するものではなく、最終判断は医療従事者ご自身の責任で行ってください。
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
