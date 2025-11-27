import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "RAG Knowledge Hub | 最先端RAG研究ナレッジベース",
  description: "arXivから毎日自動で論文を収集し、AIが厳選。AIエンジニア・コンサルタント向けに実装ブループリント・ビジネス分析・導入チェックリストを提供します。",
  keywords: ["RAG", "Retrieval-Augmented Generation", "LLM", "AI", "論文", "arXiv", "ナレッジベース"],
  authors: [{ name: "RAG Knowledge Hub Team" }],
  openGraph: {
    title: "RAG Knowledge Hub | 最先端RAG研究ナレッジベース",
    description: "AIが厳選したRAG最新論文の実装ブループリント・ビジネス分析を毎日更新",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "RAG Knowledge Hub",
    description: "AIが厳選したRAG最新論文の実装ブループリント・ビジネス分析を毎日更新",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
