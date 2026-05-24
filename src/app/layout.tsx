import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MathMind - 离散数学解题助手",
  description: "AI-powered discrete math problem solver",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-full">{children}</body>
    </html>
  );
}
