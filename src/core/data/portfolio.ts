export const portfolioPositioning = {
  brand: "Rain_dust",
  primaryRole: "Creative Engineer",
  secondaryRole: "Independent Builder",
  introduction: "把模糊想法快速构建成可运行原型的独立开发者。",
  personaTags: ["Vibe Coder"],
  capabilities: [
    { key: "ai-prototype", label: "AI 应用原型" },
    { key: "interactive-web", label: "交互式 Web 产品" },
    { key: "automation", label: "自动化工具" },
    { key: "creative-coding", label: "Creative Coding" }
  ],
  currentMission: "贵州贵客松 2026"
} as const;

export const portfolioRoleLine = `${portfolioPositioning.primaryRole} / ${portfolioPositioning.secondaryRole}`;
