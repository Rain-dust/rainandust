import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "寻迹沐雨 / RAIN_DUST",
  description:
    "寻迹沐雨的滚动电影式个人作品集：在固定视口中穿过由共享母版重组的作品碎片星图。",
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
