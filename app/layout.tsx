import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "寻辰沐雨 / RAIN_DUST",
  description:
    "寻辰沐雨的单屏数字空间：在不规则玻璃碎片中探索作品。",
  icons: {
    icon: "/rain-dust/fragments/zhiwei-node.webp",
    shortcut: "/rain-dust/fragments/zhiwei-node.webp",
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
