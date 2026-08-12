import { portfolioPositioning, portfolioRoleLine } from "../core/data/portfolio.ts";

export const site = {
  name: portfolioPositioning.brand,
  title: `${portfolioPositioning.brand} | ${portfolioPositioning.primaryRole}`,
  description: `${portfolioRoleLine}。${portfolioPositioning.introduction}`,
  author: "寻辰沐雨",
  nav: [
    { href: "/", label: "HOME", icon: "tabler:home-heart", hint: "front page" },
    { href: "/projects/", label: "WORKS", icon: "tabler:code", hint: "projects" },
    { href: "/about/", label: "ME", icon: "tabler:user-heart", hint: "profile" }
  ]
};

export const categoryLabel: Record<string, string> = {
  tech: "技术开发",
  anime: "二次元",
  life: "日常记录"
};
