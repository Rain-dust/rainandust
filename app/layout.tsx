import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "寻辰沐雨 / RAIN_DUST",
  description:
    "寻辰沐雨的私人数字空间：把念头、感受和一些忍不住想解决的麻烦做成真的。",
  icons: {
    icon: "/rain-dust/fragments/zhiwei-node.png",
    shortcut: "/rain-dust/fragments/zhiwei-node.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
