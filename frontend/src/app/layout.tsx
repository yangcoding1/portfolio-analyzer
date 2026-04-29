import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Portfolio-Analyzer — 나의 숲을 설계하다",
  description: "주식과 ETF로 안정적인 숲과 같은 포트폴리오를 구성하세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
