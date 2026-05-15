import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ads Manager | Real-time Dashboard",
  description: "Hệ thống quản lý và phân tích quảng cáo đa kênh chuyên nghiệp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="light">
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
