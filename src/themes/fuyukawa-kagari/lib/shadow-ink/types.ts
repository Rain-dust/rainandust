export type ShadowInkPresetName = "HOME" | "PROJECTS" | "BLOG" | "ABOUT" | "TRANSITION";
export type ShadowInkQuality = "HIGH" | "BALANCED" | "LOW" | "STATIC";
export type ShadowInkLayer = "overlay" | "background";
export type ShadowInkBlend = "normal" | "multiply" | "soft-light";
export type ShadowInkPauseReason =
  | "manual"
  | "hidden"
  | "blur"
  | "idle"
  | "reading"
  | "reduced-motion"
  | "coarse-pointer"
  | "unsupported"
  | null;

export interface ShadowInkConfig {
  enabled: boolean;
  opacity: number;
  force: number;
  radius: number;
  curl: number;
  velocityDissipation: number;
  densityDissipation: number;
  inkColor: [number, number, number];
  highlightColor: [number, number, number];
  signalColor: [number, number, number];
  signalRed: number;
  signalThreshold: number;
  layer: ShadowInkLayer;
  blend: ShadowInkBlend;
  quality: ShadowInkQuality;
}

export interface ShadowInkQualityConfig {
  simulationResolution: number;
  dyeResolution: number;
  pressureIterations: number;
  dprCap: number;
  frameRateCap: number;
}

export interface ShadowInkPreset {
  name: ShadowInkPresetName;
  config: ShadowInkConfig;
}

export interface ShadowInkPointerInput {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  signal: boolean;
}

export interface ShadowInkDiagnostics {
  fps: number;
  frameTime: number;
  simulationResolution: string;
  dyeResolution: string;
  webglVersion: string;
  pointerInputCount: number;
  splatCount: number;
  failureReason: string | null;
  preset: ShadowInkPresetName;
  quality: ShadowInkQuality;
  reducedMotion: boolean;
  coarsePointer: boolean;
  status: "active" | "paused" | "static" | "failed";
  pauseReason: ShadowInkPauseReason;
}

export interface ShadowInkEngine {
  init(): boolean;
  start(): void;
  pause(reason?: ShadowInkPauseReason): void;
  resume(): void;
  clear(): void;
  resize(): void;
  setPreset(preset: ShadowInkPreset): void;
  setConfig(config: Partial<ShadowInkConfig>): void;
  inject(input: ShadowInkPointerInput): void;
  getDiagnostics(): ShadowInkDiagnostics;
  destroy(): void;
}
