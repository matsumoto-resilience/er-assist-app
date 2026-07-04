import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ModuleNav from "@/components/ModuleNav";
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
        <ModuleNav />
        {children}
      </body>
    </html>
  );
}
