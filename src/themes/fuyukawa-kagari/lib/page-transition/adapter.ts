import { NativeShadowInkEngine } from "../shadow-ink/engine";
import { clonePreset } from "../shadow-ink/presets";
import type { ShadowInkEngine } from "../shadow-ink/types";
import type {
  PrototypeDirection,
  PrototypePage,
  PrototypePageTone,
  PrototypeRouteMatch
} from "./routes";

export type PrototypeRenderer = "WebGL2" | "WebGL1" | "CSS";
export type TransitionMode = "fluid" | "mask" | "reduced";

export interface TransitionAdapterDiagnostics {
  renderer: PrototypeRenderer;
  activeRafCount: number;
  coverProgress: number;
  revealProgress: number;
  lastFailure: string | null;
}

const COVER_DURATION = 470;
const REVEAL_DURATION = 340;
const REDUCED_COVER_DURATION = 70;
const REDUCED_REVEAL_DURATION = 70;
const COVER_EASING = "cubic-bezier(0.32, 0, 0.16, 1)";
const REVEAL_EASING = "cubic-bezier(0.16, 0.74, 0.18, 1)";

const TONE_STYLES: Record<
  PrototypePageTone,
  {
    deep: string;
    mid: string;
    wash: string;
    dim: string;
    ink: [number, number, number];
    highlight: [number, number, number];
  }
> = {
  paper: {
    deep: "#a4a7a1",
    mid: "#d0cec6",
    wash: "#e9e5dc",
    dim: "rgba(112, 116, 112, 0.34)",
    ink: [0.38, 0.4, 0.39],
    highlight: [0.77, 0.76, 0.72]
  },
  architecture: {
    deep: "#171918",
    mid: "#30322f",
    wash: "#555650",
    dim: "rgba(19, 21, 20, 0.7)",
    ink: [0.035, 0.042, 0.039],
    highlight: [0.19, 0.2, 0.18]
  },
  editorial: {
    deep: "#454a49",
    mid: "#707472",
    wash: "#a0a29e",
    dim: "rgba(65, 69, 68, 0.56)",
    ink: [0.16, 0.18, 0.17],
    highlight: [0.4, 0.42, 0.4]
  },
  profile: {
    deep: "#52626a",
    mid: "#7b8b91",
    wash: "#aeb9ba",
    dim: "rgba(70, 84, 91, 0.5)",
    ink: [0.16, 0.21, 0.23],
    highlight: [0.43, 0.5, 0.52]
  }
};

const PAGE_ORDER: Record<PrototypePage["id"], number> = {
  home: 0,
  projects: 1,
  blog: 2,
  about: 3
};

function routeSign(match: PrototypeRouteMatch): number {
  return PAGE_ORDER[match.toPage.id] >= PAGE_ORDER[match.fromPage.id] ? 1 : -1;
}

function entryVector(match: PrototypeRouteMatch): [number, number] {
  const sign = routeSign(match);
  switch (match.toPage.tone) {
    case "architecture":
      return [68 * sign, -54];
    case "editorial":
      return [-70 * sign, 4];
    case "profile":
      return [10 * sign, 68];
    case "paper":
      return [0, 0];
  }
}

function entryTransform(match: PrototypeRouteMatch, layer: number): string {
  const [x, y] = entryVector(match);
  const spread = layer * 6;
  const scale = Math.max(0.025, 0.052 - layer * 0.009);
  const rotation = -12 + layer * 11 * routeSign(match);
  return `translate3d(${x + spread * routeSign(match)}vmax, ${y - spread}vmax, 0) scale(${scale}) rotate(${rotation}deg)`;
}

function midpointTransform(match: PrototypeRouteMatch, layer: number): string {
  const [x, y] = entryVector(match);
  const scale = 0.58 + layer * 0.08;
  return `translate3d(${x * 0.36}vmax, ${y * 0.36}vmax, 0) scale(${scale}) rotate(${-7 + layer * 8}deg)`;
}

function coveredTransform(layer: number): string {
  return `translate3d(${(layer - 1) * 2.2}vmax, ${(1 - layer) * 1.6}vmax, 0) scale(${1.34 + layer * 0.08}) rotate(${-5 + layer * 6}deg)`;
}

function revealTransform(match: PrototypeRouteMatch, layer: number): string {
  const sign = routeSign(match);
  switch (match.toPage.tone) {
    case "paper":
      return `translate3d(0, 0, 0) scale(${1.68 + layer * 0.08}) rotate(${4 * sign}deg)`;
    case "architecture":
      return `translate3d(${-8 * sign}vmax, 6vmax, 0) scale(${1.5 + layer * 0.08}) rotate(${-4 * sign}deg)`;
    case "editorial":
      return `translate3d(${9 * sign}vmax, -1vmax, 0) scale(${1.48 + layer * 0.08}) rotate(${3 * sign}deg)`;
    case "profile":
      return `translate3d(${-2 * sign}vmax, -9vmax, 0) scale(${1.5 + layer * 0.08}) rotate(${-3 * sign}deg)`;
  }
}

function createStage(host: HTMLElement): {
  stage: HTMLElement;
  dim: HTMLElement;
  canvas: HTMLCanvasElement;
  sheets: HTMLElement[];
} {
  host.replaceChildren();
  const stage = document.createElement("div");
  stage.className = "page-transition-stage";
  stage.dataset.pageTransitionStage = "";
  stage.setAttribute("aria-hidden", "true");
  stage.innerHTML = `
    <div class="page-transition-dim" data-page-transition-dim></div>
    <div class="page-transition-safety" data-page-transition-safety>
      <div class="page-transition-safety-shape page-transition-sheet page-transition-sheet-primary" data-page-transition-safety-shape data-page-transition-sheet></div>
      <div class="page-transition-sheet page-transition-sheet-secondary" data-page-transition-sheet></div>
      <div class="page-transition-sheet page-transition-sheet-tertiary" data-page-transition-sheet></div>
    </div>
    <div class="page-transition-paper-grain" aria-hidden="true"></div>
    <canvas class="page-transition-ink" data-page-transition-canvas aria-hidden="true"></canvas>
  `;
  host.append(stage);

  const dim = stage.querySelector<HTMLElement>("[data-page-transition-dim]");
  const canvas = stage.querySelector<HTMLCanvasElement>("[data-page-transition-canvas]");
  const sheets = Array.from(stage.querySelectorAll<HTMLElement>("[data-page-transition-sheet]"));
  if (!dim || !canvas || sheets.length !== 3) {
    host.replaceChildren();
    throw new Error("Page transition stage failed to initialize");
  }
  return { stage, dim, canvas, sheets };
}

export class PageTransitionAdapter {
  private readonly host: HTMLElement;
  private readonly lifecycle = new AbortController();
  private readonly stage: HTMLElement;
  private readonly dim: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly sheets: HTMLElement[];
  private engine: ShadowInkEngine | null = null;
  private renderer: PrototypeRenderer = "CSS";
  private sheetAnimations: Animation[] = [];
  private dimAnimation: Animation | null = null;
  private injectionTimer = 0;
  private coverResolve: (() => void) | null = null;
  private lastFailure: string | null = null;
  private coverProgress = 0;
  private revealProgress = 0;
  private destroyed = false;

  constructor(host: HTMLElement, allowWebGl: boolean) {
    this.host = host;
    const dom = createStage(host);
    this.stage = dom.stage;
    this.dim = dom.dim;
    this.canvas = dom.canvas;
    this.sheets = dom.sheets;
    this.canvas.addEventListener("webglcontextlost", this.onContextLost, {
      signal: this.lifecycle.signal
    });
    this.canvas.addEventListener("webglcontextrestored", this.onContextRestored, {
      signal: this.lifecycle.signal
    });
    if (allowWebGl) this.initializeWebGl();
  }

  async cover(match: PrototypeRouteMatch, mode: TransitionMode): Promise<void> {
    this.cancelAnimations();
    this.configureRoute(match);
    this.stage.classList.add("is-active");
    this.stage.dataset.direction = match.direction;
    this.stage.dataset.transitionMode = mode;
    this.coverProgress = 0;
    this.revealProgress = 0;

    const reduced = mode === "reduced";
    const duration = reduced ? REDUCED_COVER_DURATION : COVER_DURATION;
    this.sheets.forEach((sheet, layer) => {
      sheet.style.transform = reduced ? coveredTransform(layer) : entryTransform(match, layer);
      sheet.style.opacity = reduced ? "0" : "1";
    });
    this.dim.style.opacity = "0";
    this.prepareEngine(match, mode);

    this.dimAnimation = this.dim.animate(
      [{ opacity: 0 }, { opacity: reduced ? 0.88 : 0.68 }],
      { duration, easing: "ease-out", fill: "forwards" }
    );
    this.sheetAnimations = this.sheets.map((sheet, layer) =>
      sheet.animate(
        reduced
          ? [
              { transform: coveredTransform(layer), opacity: 0 },
              { transform: coveredTransform(layer), opacity: 1 }
            ]
          : [
              { transform: entryTransform(match, layer), opacity: 1, offset: 0 },
              { transform: midpointTransform(match, layer), opacity: 1, offset: 0.56 },
              { transform: coveredTransform(layer), opacity: 1, offset: 1 }
            ],
        {
          duration: reduced ? duration : duration - layer * 18,
          delay: reduced ? 0 : layer * 12,
          easing: reduced ? "ease-out" : COVER_EASING,
          fill: "forwards"
        }
      )
    );

    await new Promise<void>((resolve) => {
      this.coverResolve = resolve;
      this.waitForAnimations(this.sheetAnimations, duration + 120).then(
        () => this.finishCover(),
        () => this.finishCover()
      );
    });
  }

  async reveal(match: PrototypeRouteMatch, mode: TransitionMode): Promise<void> {
    if (this.destroyed) return;
    this.finishCover();
    this.revealProgress = 0;
    const reduced = mode === "reduced";
    const duration = reduced ? REDUCED_REVEAL_DURATION : REVEAL_DURATION;
    this.sheetAnimations = this.sheets.map((sheet, layer) =>
      sheet.animate(
        [
          { transform: coveredTransform(layer), opacity: 1 },
          {
            transform: reduced ? coveredTransform(layer) : revealTransform(match, layer),
            opacity: 0
          }
        ],
        {
          duration: reduced ? duration : duration - layer * 14,
          delay: reduced ? 0 : layer * 10,
          easing: reduced ? "ease-in" : REVEAL_EASING,
          fill: "forwards"
        }
      )
    );
    this.dimAnimation = this.dim.animate(
      [{ opacity: reduced ? 0.88 : 0.68 }, { opacity: 0 }],
      { duration, easing: "ease-out", fill: "forwards" }
    );
    await this.waitForAnimations(this.sheetAnimations, duration + (reduced ? 0 : 20) + 120);
    if (this.destroyed) return;
    this.revealProgress = 1;
    this.stage.classList.remove("is-active");
    this.sheets.forEach((sheet) => (sheet.style.opacity = "0"));
    this.canvas.style.opacity = "0";
    this.engine?.clear();
    this.engine?.pause("idle");
  }

  async initialReveal(page: PrototypePage, mode: TransitionMode): Promise<void> {
    const match: PrototypeRouteMatch = {
      from: location.pathname,
      to: location.pathname,
      fromPage: page,
      toPage: page,
      direction: `${page.id}-to-${page.id}`
    };
    this.configureRoute(match);
    this.stage.classList.add("is-active");
    this.stage.dataset.transitionMode = mode;
    this.sheets.forEach((sheet, layer) => {
      sheet.style.transform = coveredTransform(layer);
      sheet.style.opacity = "1";
    });
    this.dim.style.opacity = mode === "reduced" ? "0.5" : "0.64";
    await this.reveal(match, mode === "fluid" ? "mask" : mode);
  }

  async recover(match: PrototypeRouteMatch, mode: TransitionMode): Promise<void> {
    if (this.destroyed) return;
    this.finishCover();
    await this.reveal(match, mode);
  }

  forceCovered(): void {
    if (this.destroyed || !this.stage.classList.contains("is-active")) return;
    this.sheetAnimations.forEach((animation) => animation.cancel());
    this.sheets.forEach((sheet, layer) => {
      sheet.style.transform = coveredTransform(layer);
      sheet.style.opacity = "1";
    });
    this.dim.style.opacity = "0.68";
    this.finishCover();
  }

  pause(): void {
    this.engine?.pause("hidden");
  }

  resume(): void {
    if (this.stage.classList.contains("is-active") && this.stage.dataset.transitionMode === "fluid") {
      this.engine?.resume();
    }
  }

  resize(): void {
    this.engine?.resize();
  }

  reset(): void {
    this.cancelAnimations();
    this.stage.classList.remove("is-active");
    this.stage.removeAttribute("data-direction");
    this.stage.removeAttribute("data-transition-mode");
    this.dim.style.opacity = "0";
    this.sheets.forEach((sheet) => (sheet.style.opacity = "0"));
    this.canvas.style.opacity = "0";
    this.engine?.clear();
    this.engine?.pause("manual");
    this.coverProgress = 0;
    this.revealProgress = 0;
  }

  getDiagnostics(): TransitionAdapterDiagnostics {
    const engineDiagnostics = this.engine?.getDiagnostics();
    const coverTiming = this.sheetAnimations[0]?.effect?.getComputedTiming();
    const progress = typeof coverTiming?.progress === "number" ? coverTiming.progress : 0;
    return {
      renderer: this.renderer,
      activeRafCount: engineDiagnostics?.status === "active" ? 1 : 0,
      coverProgress: Number((this.coverProgress || progress).toFixed(3)),
      revealProgress: Number(this.revealProgress.toFixed(3)),
      lastFailure: this.lastFailure ?? engineDiagnostics?.failureReason ?? null
    };
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.lifecycle.abort();
    this.cancelAnimations();
    this.engine?.destroy();
    this.engine = null;
    this.host.replaceChildren();
  }

  private configureRoute(match: PrototypeRouteMatch): void {
    const target = TONE_STYLES[match.toPage.tone];
    const source = TONE_STYLES[match.fromPage.tone];
    this.stage.dataset.fromTone = match.fromPage.tone;
    this.stage.dataset.toTone = match.toPage.tone;
    this.stage.style.setProperty("--transition-ink-deep", target.deep);
    this.stage.style.setProperty("--transition-ink-mid", target.mid);
    this.stage.style.setProperty("--transition-ink-wash", target.wash);
    this.stage.style.setProperty("--transition-source-ink", source.deep);
    this.stage.style.setProperty("--transition-dim", target.dim);
  }

  private prepareEngine(match: PrototypeRouteMatch, mode: TransitionMode): void {
    if (!this.engine || mode !== "fluid") {
      this.canvas.style.opacity = "0";
      this.engine?.pause(mode === "reduced" ? "reduced-motion" : "manual");
      return;
    }
    const tone = TONE_STYLES[match.toPage.tone];
    this.engine.setConfig({
      opacity: match.toPage.tone === "paper" ? 0.64 : 0.86,
      radius: match.toPage.tone === "architecture" ? 0.058 : 0.048,
      force: 1.08,
      curl: 25,
      inkColor: tone.ink,
      highlightColor: tone.highlight,
      signalRed: match.toPage.tone === "architecture" ? 0.055 : 0.018
    });
    this.canvas.style.opacity = "0.9";
    this.engine.clear();
    this.engine.resume();
    this.startProgrammaticInk(match);
  }

  private initializeWebGl(): void {
    const preset = clonePreset("TRANSITION");
    preset.config = {
      ...preset.config,
      quality: "LOW",
      opacity: 0.86,
      radius: 0.052,
      force: 1.08,
      curl: 25,
      signalRed: 0.04,
      layer: "overlay",
      blend: "normal"
    };
    const engine = new NativeShadowInkEngine(this.canvas, preset);
    if (!engine.init()) {
      this.lastFailure = engine.getDiagnostics().failureReason ?? "WebGL initialization failed";
      engine.destroy();
      this.renderer = "CSS";
      return;
    }
    this.engine = engine;
    this.renderer = engine.getDiagnostics().webglVersion === "WebGL2" ? "WebGL2" : "WebGL1";
    engine.pause("manual");
  }

  private startProgrammaticInk(match: PrototypeRouteMatch): void {
    if (!this.engine) return;
    const startedAt = performance.now();
    const emit = () => {
      const progress = Math.min(1, (performance.now() - startedAt) / COVER_DURATION);
      const sign = routeSign(match);
      let x = 0.5;
      let y = 0.5;
      let dx = 0;
      let dy = 0;
      switch (match.toPage.tone) {
        case "architecture":
          x = sign > 0 ? 1.04 - progress * 0.92 : -0.04 + progress * 0.92;
          y = 0.12 + progress * 0.76;
          dx = -0.048 * sign;
          dy = 0.044;
          break;
        case "editorial":
          x = sign > 0 ? -0.04 + progress * 1.08 : 1.04 - progress * 1.08;
          y = 0.5 + Math.sin(progress * Math.PI * 2) * 0.12;
          dx = 0.05 * sign;
          dy = Math.cos(progress * Math.PI * 2) * 0.022;
          break;
        case "profile":
          x = 0.28 + progress * 0.46;
          y = 1.04 - progress * 1.08;
          dx = 0.025 * sign;
          dy = -0.052;
          break;
        case "paper": {
          const angle = progress * Math.PI * 2.4;
          const radius = 0.32 * (1 - progress * 0.55);
          x = 0.5 + Math.cos(angle) * radius;
          y = 0.5 + Math.sin(angle) * radius;
          dx = -Math.sin(angle) * 0.042;
          dy = Math.cos(angle) * 0.042;
          break;
        }
      }
      for (const offset of [-0.12, 0, 0.12]) {
        this.engine?.inject({
          x: Math.min(1, Math.max(0, x + offset * (Math.abs(dy) > Math.abs(dx) ? 1 : 0.35))),
          y: Math.min(1, Math.max(0, y + offset * (Math.abs(dx) >= Math.abs(dy) ? 1 : 0.35))),
          dx,
          dy,
          speed: 1.78,
          signal: offset === 0 && match.toPage.tone === "architecture" && progress > 0.52 && progress < 0.64
        });
      }
      if (progress >= 1) this.stopProgrammaticInk();
    };
    emit();
    this.injectionTimer = window.setInterval(emit, 30);
  }

  private stopProgrammaticInk(): void {
    if (this.injectionTimer) window.clearInterval(this.injectionTimer);
    this.injectionTimer = 0;
  }

  private finishCover(): void {
    this.stopProgrammaticInk();
    this.coverProgress = 1;
    this.sheets.forEach((sheet, layer) => {
      sheet.style.transform = coveredTransform(layer);
      sheet.style.opacity = "1";
    });
    const resolve = this.coverResolve;
    this.coverResolve = null;
    resolve?.();
  }

  private cancelAnimations(): void {
    this.stopProgrammaticInk();
    this.sheetAnimations.forEach((animation) => animation.cancel());
    this.sheetAnimations = [];
    this.dimAnimation?.cancel();
    this.dimAnimation = null;
    this.coverResolve?.();
    this.coverResolve = null;
  }

  private async waitForAnimations(animations: Animation[], limitMs: number): Promise<void> {
    let timeoutId = 0;
    const timeout = new Promise<void>((resolve) => {
      timeoutId = window.setTimeout(resolve, limitMs);
    });
    const finished = Promise.all(
      animations.map((animation) => animation.finished.catch(() => undefined))
    ).then(() => undefined);
    await Promise.race([finished, timeout]);
    if (timeoutId) window.clearTimeout(timeoutId);
  }

  private readonly onContextLost = (): void => {
    this.lastFailure = "WebGL context lost";
    this.renderer = "CSS";
    this.canvas.style.opacity = "0";
    this.engine?.pause("unsupported");
  };

  private readonly onContextRestored = (): void => {
    this.lastFailure = "WebGL context restored; mask fallback retained for current transaction";
  };
}
