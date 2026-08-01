import type {
  ShadowInkConfig,
  ShadowInkPreset,
  ShadowInkPresetName,
  ShadowInkQuality,
  ShadowInkQualityConfig
} from "./types";

export const SHADOW_INK_QUALITY: Record<ShadowInkQuality, ShadowInkQualityConfig> = {
  HIGH: {
    simulationResolution: 192,
    dyeResolution: 1024,
    pressureIterations: 24,
    dprCap: 1.75,
    frameRateCap: 60
  },
  BALANCED: {
    simulationResolution: 144,
    dyeResolution: 768,
    pressureIterations: 18,
    dprCap: 1.35,
    frameRateCap: 60
  },
  LOW: {
    simulationResolution: 96,
    dyeResolution: 512,
    pressureIterations: 12,
    dprCap: 1,
    frameRateCap: 30
  },
  STATIC: {
    simulationResolution: 0,
    dyeResolution: 0,
    pressureIterations: 0,
    dprCap: 1,
    frameRateCap: 0
  }
};

const base: ShadowInkConfig = {
  enabled: true,
  opacity: 0.54,
  force: 0.82,
  radius: 0.092,
  curl: 19,
  velocityDissipation: 0.986,
  densityDissipation: 0.978,
  inkColor: [0.18, 0.19, 0.19],
  highlightColor: [0.58, 0.56, 0.52],
  signalColor: [0.38, 0.07, 0.065],
  signalRed: 0.12,
  signalThreshold: 1.55,
  layer: "overlay",
  blend: "multiply",
  quality: "BALANCED"
};

export const SHADOW_INK_PRESETS: Record<ShadowInkPresetName, ShadowInkPreset> = {
  HOME: {
    name: "HOME",
    config: {
      ...base,
      opacity: 0.28,
      force: 0.62,
      radius: 0.052,
      curl: 12,
      velocityDissipation: 0.976,
      densityDissipation: 0.954,
      inkColor: [0.37, 0.43, 0.49],
      highlightColor: [0.65, 0.68, 0.69],
      signalColor: [0.43, 0.26, 0.3],
      signalRed: 0.035,
      signalThreshold: 1.95,
      layer: "overlay",
      blend: "soft-light"
    }
  },
  PROJECTS: {
    name: "PROJECTS",
    config: {
      ...base,
      opacity: 0.34,
      force: 0.72,
      radius: 0.078,
      curl: 14,
      velocityDissipation: 0.982,
      densityDissipation: 0.962,
      signalRed: 0.045,
      signalThreshold: 1.82,
      layer: "overlay",
      blend: "soft-light"
    }
  },
  BLOG: {
    name: "BLOG",
    config: {
      ...base,
      opacity: 0.24,
      force: 0.54,
      radius: 0.08,
      curl: 10,
      velocityDissipation: 0.978,
      densityDissipation: 0.952,
      inkColor: [0.23, 0.25, 0.26],
      highlightColor: [0.5, 0.52, 0.52],
      signalColor: [0.42, 0.19, 0.2],
      signalRed: 0,
      signalThreshold: 2,
      layer: "background",
      blend: "multiply"
    }
  },
  ABOUT: {
    name: "ABOUT",
    config: {
      ...base,
      opacity: 0.46,
      force: 0.86,
      radius: 0.095,
      curl: 17,
      velocityDissipation: 0.984,
      densityDissipation: 0.97,
      inkColor: [0.2, 0.23, 0.25],
      highlightColor: [0.54, 0.56, 0.55],
      signalColor: [0.39, 0.14, 0.15],
      signalRed: 0.08,
      signalThreshold: 1.7,
      layer: "background",
      blend: "multiply"
    }
  },
  TRANSITION: {
    name: "TRANSITION",
    config: {
      ...base,
      opacity: 0.82,
      force: 1.35,
      radius: 0.06,
      curl: 27,
      velocityDissipation: 0.99,
      densityDissipation: 0.986,
      signalRed: 0.2,
      signalThreshold: 1.3,
      layer: "overlay",
      blend: "multiply"
    }
  }
};

export function presetForPath(pathname: string): ShadowInkPreset {
  if (pathname.startsWith("/projects") || pathname.startsWith("/works")) {
    return SHADOW_INK_PRESETS.PROJECTS;
  }
  if (pathname.startsWith("/blog")) return SHADOW_INK_PRESETS.BLOG;
  if (pathname.startsWith("/about") || pathname.startsWith("/me")) {
    return SHADOW_INK_PRESETS.ABOUT;
  }
  return SHADOW_INK_PRESETS.HOME;
}

export function clonePreset(name: ShadowInkPresetName): ShadowInkPreset {
  const preset = SHADOW_INK_PRESETS[name];
  return { name: preset.name, config: { ...preset.config } };
}
