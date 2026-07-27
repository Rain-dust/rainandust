import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "寻辰沐雨 / RAIN_DUST — DAY MASK / NIGHT SELF",
  description:
    "寻辰沐雨的滚动电影式个人作品集：白昼外壳侵蚀、下潜，并召唤由固定玻璃遗物碎片重组的 Earth Online。",
  openGraph: {
    title: "寻辰沐雨 / RAIN_DUST — DAY MASK / NIGHT SELF",
    description: "白昼侵蚀，下潜至由十二片夜间遗物重组的 Earth Online。",
    images: [{ url: "/og.png", width: 1672, height: 941 }],
  },
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
