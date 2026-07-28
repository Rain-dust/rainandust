import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "寻辰沐雨 / RAIN_DUST",
  description:
    "寻辰沐雨的个人作品集。白昼只是表面，影子短暂接管一切。",
  openGraph: {
    title: "寻辰沐雨 / RAIN_DUST",
    description: "白昼只是表面，影子短暂接管一切。",
    images: [{ url: "/og.png", width: 1734, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "寻辰沐雨 / RAIN_DUST",
    description: "白昼只是表面，影子短暂接管一切。",
    images: ["/og.png"],
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
