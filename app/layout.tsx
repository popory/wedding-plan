import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl =
  process.env.GITHUB_PAGES === "true"
    ? "https://popory.github.io/wedding-plan/"
    : "https://serin-hyerin-wedding-plan-2026.popory8.chatgpt.site/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "혜린이랑 결혼 준비하기",
  description: "더채플앳 청담 결혼 준비 예산, 일정, 계약과 신혼여행을 한눈에 확인하는 대시보드",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
  openGraph: {
    title: "혜린이랑 결혼 준비하기",
    description: "2026년 11월 1일 더채플앳 청담 결혼 준비 대시보드",
    type: "website",
    images: [
      {
        url: `${basePath}/og.png`,
        width: 1731,
        height: 908,
        alt: "결혼 준비 플래너와 예산 계산기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "혜린이랑 결혼 준비하기",
    description: "2026년 11월 1일 더채플앳 청담 결혼 준비 대시보드",
    images: [`${basePath}/og.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
