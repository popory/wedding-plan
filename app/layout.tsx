import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "혜린이랑 결혼 준비하기",
  description: "더채플앳 청담 결혼 준비 예산, 일정, 계약과 신혼여행을 한눈에 확인하는 대시보드",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "혜린이랑 결혼 준비하기",
    description: "2026년 11월 1일 더채플앳 청담 결혼 준비 대시보드",
    type: "website",
    images: [
      {
        url: "/og.png",
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
    images: ["/og.png"],
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
