import { NativeShadowInkEngine } from "./engine";
import { clonePreset, presetForPath, SHADOW_INK_PRESETS } from "./presets";
import type {
  ShadowInkBlend,
  ShadowInkConfig,
  ShadowInkDiagnostics,
  ShadowInkEngine,
  ShadowInkLayer,
  ShadowInkPreset,
  ShadowInkPresetName,
  ShadowInkQuality
} from "./types";

const SESSION_KEY = "rain-dust-shadow-ink-debug-v1";
const PAGE_TRANSITION_SESSION_KEY = "rain-dust-page-transition-prototype-v1";
const GLOBAL_KEY = "__rainDustShadowInkDebug";
const PANEL_SELECTOR = "[data-shadow-ink-panel]";

interface RequestedMode {
  mode: "debug" | "off" | "session" | "none";
  forceMotion: boolean;
}

interface ShadowInkDebugState {
  status: string;
  originalMotion: "REDUCED" | "NORMAL";
  override: "ACTIVE" | "INACTIVE";
  preview: string;
  webgl: string;
  fps: number;
  simulationResolution: string;
  dyeResolution: string;
  pointerInputCount: number;
  splatCount: number;
  canvasCount: number;
  engineCount: number;
  failureReason: string | null;
}

interface ShadowInkRuntime {
  updateRoute(forceMotion?: boolean): void;
  clear(): void;
  getDebugState(): ShadowInkDebugState;
  destroy(removeDom?: boolean): void;
}

declare global {
  interface Window {
    __rainDustShadowInkDebug?: ShadowInkRuntime;
    __rainDustShadowInkBootstrapCleanup?: () => void;
  }
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function requestedMode(): RequestedMode {
  const pageTransitionParams = new URLSearchParams(window.location.search);
  const pageTransitionMode = pageTransitionParams.get("page-transition");
  let pageTransitionEnabled = pageTransitionMode === "prototype";

  if (pageTransitionMode === "off") {
    pageTransitionEnabled = false;
  } else if (!pageTransitionMode) {
    try {
      const stored = sessionStorage.getItem(PAGE_TRANSITION_SESSION_KEY);
      pageTransitionEnabled = stored
        ? Boolean((JSON.parse(stored) as { enabled?: boolean }).enabled)
        : false;
    } catch {
      pageTransitionEnabled = false;
    }
  }

  if (pageTransitionEnabled) {
    sessionStorage.removeItem(SESSION_KEY);
    return { mode: "off", forceMotion: false };
  }

  const params = new URLSearchParams(window.location.search);
  const value = params.get("shadow-ink");
  if (value === "debug") {
    const forceMotion = params.get("motion") === "force";
    sessionStorage.setItem(SESSION_KEY, forceMotion ? "force" : "debug");
    return { mode: "debug", forceMotion };
  }
  if (value === "off") {
    sessionStorage.removeItem(SESSION_KEY);
    return { mode: "off", forceMotion: false };
  }
  const sessionMode = sessionStorage.getItem(SESSION_KEY);
  if (sessionMode === "force") return { mode: "session", forceMotion: true };
  if (sessionMode === "debug") return { mode: "session", forceMotion: false };
  return { mode: "none", forceMotion: false };
}

function getHost(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-shadow-ink-debug-host]");
}

function createDebugDom(host: HTMLElement): {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  staticLayer: HTMLElement;
  panel: HTMLElement;
} {
  host.replaceChildren();
  const root = document.createElement("div");
  root.className = "shadow-ink-debug";
  root.dataset.shadowInkDebug = "active";
  root.innerHTML = `
    <canvas class="shadow-ink-canvas" data-shadow-ink-canvas aria-hidden="true"></canvas>
    <div class="shadow-ink-static" data-shadow-ink-static aria-hidden="true"></div>
    <aside class="shadow-ink-panel" data-shadow-ink-panel aria-label="Shadow Ink 调试面板">
      <button class="shadow-ink-panel-toggle" type="button" data-shadow-action="collapse" aria-expanded="true">
        <span data-shadow-panel-label>Shadow Ink</span><span data-shadow-panel-icon aria-hidden="true">−</span>
      </button>
      <div class="shadow-ink-panel-body">
        <div class="shadow-ink-status">
          <strong data-shadow-diagnostic="status">initializing</strong>
          <span data-shadow-diagnostic="webglVersion">probing</span>
        </div>
        <label class="shadow-ink-check">
          <input type="checkbox" data-shadow-config="enabled" checked />
          <span>Enabled</span>
        </label>
        <label>
          <span>Page Preset</span>
          <select data-shadow-config="preset">
            ${Object.keys(SHADOW_INK_PRESETS).map((name) => `<option value="${name}">${name}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Opacity <output data-shadow-output="opacity"></output></span>
          <input type="range" min="0" max="1" step="0.01" data-shadow-config="opacity" />
        </label>
        <label>
          <span>Force <output data-shadow-output="force"></output></span>
          <input type="range" min="0.1" max="2" step="0.01" data-shadow-config="force" />
        </label>
        <label>
          <span>Radius <output data-shadow-output="radius"></output></span>
          <input type="range" min="0.02" max="0.2" step="0.002" data-shadow-config="radius" />
        </label>
        <label>
          <span>Curl <output data-shadow-output="curl"></output></span>
          <input type="range" min="0" max="40" step="1" data-shadow-config="curl" />
        </label>
        <label>
          <span>Dissipation <output data-shadow-output="densityDissipation"></output></span>
          <input type="range" min="0.9" max="0.995" step="0.001" data-shadow-config="densityDissipation" />
        </label>
        <label>
          <span>Signal Red <output data-shadow-output="signalRed"></output></span>
          <input type="range" min="0" max="0.3" step="0.01" data-shadow-config="signalRed" />
        </label>
        <div class="shadow-ink-select-grid">
          <label><span>Quality</span><select data-shadow-config="quality">
            <option>HIGH</option><option>BALANCED</option><option>LOW</option><option>STATIC</option>
          </select></label>
          <label><span>Layer</span><select data-shadow-config="layer">
            <option value="overlay">Overlay</option><option value="background">Background-like</option>
          </select></label>
          <label><span>Blend</span><select data-shadow-config="blend">
            <option value="normal">Normal</option><option value="multiply">Multiply</option><option value="soft-light">Soft Light</option>
          </select></label>
        </div>
        <label class="shadow-ink-check">
          <input type="checkbox" data-shadow-config="beforeAfter" />
          <span>Before / After</span>
        </label>
        <div class="shadow-ink-actions">
          <button type="button" data-shadow-action="clear">Clear</button>
          <button type="button" data-shadow-action="reset">Reset</button>
        </div>
        <dl class="shadow-ink-diagnostics">
          <div><dt>FPS</dt><dd data-shadow-diagnostic="fps">0</dd></div>
          <div><dt>Frame</dt><dd data-shadow-diagnostic="frameTime">0 ms</dd></div>
          <div><dt>Simulation</dt><dd data-shadow-diagnostic="simulationResolution">—</dd></div>
          <div><dt>Dye</dt><dd data-shadow-diagnostic="dyeResolution">—</dd></div>
          <div><dt>Preset</dt><dd data-shadow-diagnostic="preset">—</dd></div>
          <div><dt>Original Motion</dt><dd data-shadow-diagnostic="reducedMotion">—</dd></div>
          <div><dt>Override</dt><dd data-shadow-diagnostic="override">—</dd></div>
          <div><dt>Preview</dt><dd data-shadow-diagnostic="preview">—</dd></div>
          <div><dt>Pointer</dt><dd data-shadow-diagnostic="pointerInputCount">0</dd></div>
          <div><dt>Splats</dt><dd data-shadow-diagnostic="splatCount">0</dd></div>
          <div><dt>Canvas</dt><dd data-shadow-diagnostic="canvasCount">1</dd></div>
          <div><dt>Engine</dt><dd data-shadow-diagnostic="engineCount">0</dd></div>
          <div class="shadow-ink-diagnostic-wide"><dt>Failure</dt><dd data-shadow-diagnostic="failureReason">none</dd></div>
        </dl>
      </div>
    </aside>
  `;
  host.append(root);
  const canvas = root.querySelector<HTMLCanvasElement>("[data-shadow-ink-canvas]");
  const staticLayer = root.querySelector<HTMLElement>("[data-shadow-ink-static]");
  const panel = root.querySelector<HTMLElement>(PANEL_SELECTOR);
  if (!canvas || !staticLayer || !panel) throw new Error("Shadow Ink debug DOM failed to initialize");
  return { root, canvas, staticLayer, panel };
}

class ShadowInkDebugRuntime implements ShadowInkRuntime {
  private readonly host: HTMLElement;
  private readonly root: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly staticLayer: HTMLElement;
  private readonly panel: HTMLElement;
  private readonly lifecycle = new AbortController();
  private readonly reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  private readonly finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  private engine: ShadowInkEngine | null = null;
  private preset: ShadowInkPreset;
  private config: ShadowInkConfig;
  private inputFrame = 0;
  private resizeTimer = 0;
  private diagnosticTimer = 0;
  private pointerInputCount = 0;
  private lastMotionEventAt = 0;
  private lastMotionEventX = -1;
  private lastMotionEventY = -1;
  private lastPointer: { x: number; y: number; at: number } | null = null;
  private pendingPointer: PointerEvent | null = null;
  private signalCooldownUntil = 0;
  private readingSuppressed = false;
  private manualPause = false;
  private forceMotionRequested = false;
  private forceMotionActive = false;
  private hasAutoCollapsed = false;
  private failureReason: string | null = null;
  private staticReason: "reduced-motion" | "coarse-pointer" | "unsupported" | null = null;

  constructor(host: HTMLElement, forceMotion: boolean) {
    this.host = host;
    const dom = createDebugDom(host);
    this.root = dom.root;
    this.canvas = dom.canvas;
    this.staticLayer = dom.staticLayer;
    this.panel = dom.panel;
    this.forceMotionRequested = forceMotion;
    this.forceMotionActive = this.canForceMotion(forceMotion);
    const routePreset = presetForPath(location.pathname);
    const initialPreset = this.forceMotionActive && routePreset.name === "PROJECTS"
      ? "TRANSITION"
      : routePreset.name;
    this.preset = clonePreset(initialPreset);
    this.config = { ...this.preset.config };
    this.bind();
    this.applyCapabilities();
    this.syncPanel();
    this.updateDiagnostics();
  }

  updateRoute(forceMotion = this.forceMotionRequested): void {
    const wasForced = this.forceMotionActive;
    this.forceMotionRequested = forceMotion;
    this.forceMotionActive = this.canForceMotion(forceMotion);
    const routePreset = presetForPath(location.pathname);
    if (wasForced && !this.forceMotionActive && this.preset.name === "TRANSITION") {
      this.setPreset(routePreset.name);
    } else if (!wasForced && this.forceMotionActive && routePreset.name === "PROJECTS") {
      this.setPreset("TRANSITION");
    } else if (this.preset.name === "TRANSITION" && routePreset.name !== "PROJECTS") {
      this.setPreset(routePreset.name);
    } else if (this.preset.name !== "TRANSITION") {
      this.setPreset(routePreset.name);
    }
    this.lastPointer = null;
    this.readingSuppressed = false;
    this.root.dataset.shadowInkRoute = routePreset.name.toLowerCase();
    this.applyCapabilities();
  }

  clear(): void {
    this.engine?.clear();
  }

  getDebugState(): ShadowInkDebugState {
    const diagnostics = this.currentDiagnostics();
    return {
      status: this.statusLabel(diagnostics),
      originalMotion: this.reducedMotion.matches ? "REDUCED" : "NORMAL",
      override: this.forceMotionActive ? "ACTIVE" : "INACTIVE",
      preview: this.previewLabel(),
      webgl: diagnostics.webglVersion,
      fps: diagnostics.fps,
      simulationResolution: diagnostics.simulationResolution,
      dyeResolution: diagnostics.dyeResolution,
      pointerInputCount: this.pointerInputCount,
      splatCount: diagnostics.splatCount,
      canvasCount: document.querySelectorAll("[data-shadow-ink-canvas]").length,
      engineCount: this.engine ? 1 : 0,
      failureReason: diagnostics.failureReason ?? this.failureReason
    };
  }

  destroy(removeDom = true): void {
    this.lifecycle.abort();
    if (this.inputFrame) cancelAnimationFrame(this.inputFrame);
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    if (this.diagnosticTimer) clearInterval(this.diagnosticTimer);
    this.engine?.destroy();
    this.engine = null;
    this.inputFrame = 0;
    this.resizeTimer = 0;
    this.diagnosticTimer = 0;
    if (removeDom) this.host.replaceChildren();
    if (window[GLOBAL_KEY] === this) delete window[GLOBAL_KEY];
  }

  private bind(): void {
    const { signal } = this.lifecycle;
    document.addEventListener("pointermove", this.onPointerMove, { passive: true, signal });
    document.addEventListener("mousemove", this.onPointerMove, { passive: true, signal });
    document.addEventListener("pointerleave", this.onPointerLeave, { passive: true, signal });
    document.addEventListener("visibilitychange", this.onVisibilityChange, { signal });
    document.addEventListener("astro:page-load", this.updateRouteBound, { signal });
    document.addEventListener("astro:before-swap", this.onBeforeSwap, { signal });
    window.addEventListener("resize", this.onResize, { passive: true, signal });
    window.addEventListener("blur", this.onWindowBlur, { signal });
    window.addEventListener("focus", this.onWindowFocus, { signal });
    this.reducedMotion.addEventListener("change", this.onCapabilityChange, { signal });
    this.finePointer.addEventListener("change", this.onCapabilityChange, { signal });
    this.panel.addEventListener("input", this.onPanelInput, { signal });
    this.panel.addEventListener("change", this.onPanelInput, { signal });
    this.panel.addEventListener("click", this.onPanelClick, { signal });
    this.diagnosticTimer = window.setInterval(() => this.updateDiagnostics(), 400);
  }

  private applyCapabilities(): void {
    this.engine?.destroy();
    this.engine = null;
    this.staticReason = null;
    this.failureReason = null;
    this.root.classList.remove("is-static");
    this.root.dataset.motionOverride = this.forceMotionActive ? "active" : "inactive";

    if (!this.finePointer.matches) {
      this.showStaticFallback("coarse-pointer");
      return;
    }
    if (this.reducedMotion.matches && !this.forceMotionActive) {
      this.staticReason = "reduced-motion";
      this.showStaticFallback("reduced-motion");
      return;
    }

    const effectiveConfig = this.effectiveConfig();
    this.engine = new NativeShadowInkEngine(this.canvas, {
      name: this.preset.name,
      config: effectiveConfig
    });
    if (!this.engine.init()) {
      this.failureReason = this.engine.getDiagnostics().failureReason ?? "unsupported";
      this.engine.destroy();
      this.engine = null;
      this.showStaticFallback("unsupported");
      return;
    }
    this.engine.start();
    this.applyEffectiveConfig();
    this.syncPanel();
    this.updateDiagnostics();
    if (this.forceMotionActive && !this.hasAutoCollapsed) {
      this.hasAutoCollapsed = true;
      this.setPanelCollapsed(true);
    }
  }

  private setPreset(name: ShadowInkPresetName): void {
    this.preset = clonePreset(name);
    this.config = { ...this.preset.config };
    this.engine?.setPreset({ name, config: this.effectiveConfig() });
    this.root.dataset.shadowInkRoute = name.toLowerCase();
    this.syncPanel();
    this.applyEffectiveConfig();
  }

  private applyEffectiveConfig(): void {
    const effectiveOpacity = this.readingSuppressed ? this.config.opacity * 0.12 : this.config.opacity;
    this.engine?.setConfig({ ...this.effectiveConfig(), opacity: effectiveOpacity });
    this.root.style.setProperty("--shadow-ink-opacity", String(this.config.enabled ? effectiveOpacity : 0));
    this.root.dataset.layer = this.config.layer;
    this.root.dataset.blend = this.forceMotionActive ? "normal" : this.config.blend;
    this.root.classList.toggle("is-disabled", !this.config.enabled);
  }

  private canForceMotion(requested: boolean): boolean {
    return import.meta.env.DEV && requested && this.finePointer.matches;
  }

  private effectiveQuality(): ShadowInkQuality {
    if (!this.finePointer.matches) return "STATIC";
    if (this.reducedMotion.matches && !this.forceMotionActive) return "STATIC";
    if (this.forceMotionActive) return "LOW";
    return this.config.quality;
  }

  private effectiveConfig(): ShadowInkConfig {
    return { ...this.config, quality: this.effectiveQuality() };
  }

  private showStaticFallback(
    reason: "reduced-motion" | "coarse-pointer" | "unsupported"
  ): void {
    this.staticReason = reason;
    this.root.classList.add("is-static");
    this.syncPanel();
    this.updateDiagnostics();
  }

  private setPanelCollapsed(collapsed: boolean): void {
    this.panel.classList.toggle("is-collapsed", collapsed);
    const toggle = this.panel.querySelector<HTMLButtonElement>("[data-shadow-action='collapse']");
    toggle?.setAttribute("aria-expanded", String(!collapsed));
    const label = this.panel.querySelector<HTMLElement>("[data-shadow-panel-label]");
    const icon = this.panel.querySelector<HTMLElement>("[data-shadow-panel-icon]");
    if (label) label.textContent = collapsed ? "INK DEBUG" : "Shadow Ink";
    if (icon) icon.textContent = collapsed ? "+" : "−";
  }

  private syncPanel(): void {
    const values: Record<string, string | boolean> = {
      enabled: this.config.enabled,
      preset: this.preset.name,
      opacity: String(this.config.opacity),
      force: String(this.config.force),
      radius: String(this.config.radius),
      curl: String(this.config.curl),
      densityDissipation: String(this.config.densityDissipation),
      signalRed: String(this.config.signalRed),
      quality: this.config.quality,
      layer: this.config.layer,
      blend: this.config.blend
    };
    for (const [key, value] of Object.entries(values)) {
      const control = this.panel.querySelector<HTMLInputElement | HTMLSelectElement>(
        `[data-shadow-config="${key}"]`
      );
      if (!control) continue;
      if (control instanceof HTMLInputElement && control.type === "checkbox") {
        control.checked = Boolean(value);
      } else {
        control.value = String(value);
      }
      const output = this.panel.querySelector<HTMLOutputElement>(`[data-shadow-output="${key}"]`);
      if (output) output.value = Number(value).toFixed(key === "curl" ? 0 : 2);
    }
  }

  private currentDiagnostics(): ShadowInkDiagnostics {
    const fallback: ShadowInkDiagnostics = {
      fps: 0,
      frameTime: 0,
      simulationResolution: "static",
      dyeResolution: "static",
      webglVersion: "none",
      pointerInputCount: 0,
      splatCount: 0,
      failureReason: this.failureReason,
      preset: this.preset.name,
      quality: this.effectiveQuality(),
      reducedMotion: this.reducedMotion.matches,
      coarsePointer: !this.finePointer.matches,
      status: "static",
      pauseReason: this.staticReason
    };
    return this.engine?.getDiagnostics() ?? fallback;
  }

  private statusLabel(diagnostics: ShadowInkDiagnostics): string {
    if (this.forceMotionActive && !this.staticReason && diagnostics.status !== "failed") {
      return "FORCED MOTION PREVIEW";
    }
    return this.staticReason
      ? `STATIC / ${this.staticReason.replace("-", " ").toUpperCase()}`
      : this.readingSuppressed
        ? "ACTIVE / READING SUPPRESSED"
        : diagnostics.status.toUpperCase();
  }

  private previewLabel(): string {
    if (this.forceMotionActive && this.preset.name === "TRANSITION") {
      return "TRANSITION PREVIEW";
    }
    return this.preset.name;
  }

  private updateDiagnostics(): void {
    const diagnostics = this.currentDiagnostics();
    const values: Record<string, string> = {
      status: this.statusLabel(diagnostics),
      webglVersion: diagnostics.webglVersion,
      fps: String(diagnostics.fps),
      frameTime: `${diagnostics.frameTime} ms`,
      simulationResolution: diagnostics.simulationResolution,
      dyeResolution: diagnostics.dyeResolution,
      preset: diagnostics.preset,
      reducedMotion: diagnostics.reducedMotion ? "REDUCED" : "NORMAL",
      override: this.forceMotionActive ? "ACTIVE" : "INACTIVE",
      preview: this.previewLabel(),
      pointerInputCount: String(this.pointerInputCount),
      splatCount: String(diagnostics.splatCount),
      canvasCount: String(document.querySelectorAll("[data-shadow-ink-canvas]").length),
      engineCount: this.engine ? "1" : "0",
      failureReason: diagnostics.failureReason ?? this.failureReason ?? "none"
    };
    for (const [key, value] of Object.entries(values)) {
      const node = this.panel.querySelector<HTMLElement>(`[data-shadow-diagnostic="${key}"]`);
      if (node) node.textContent = value;
    }
    this.panel.dataset.shadowInkState = JSON.stringify(this.getDebugState());
  }

  private readonly onPointerMove = (event: PointerEvent | MouseEvent): void => {
    const now = performance.now();
    if (
      event.clientX === this.lastMotionEventX &&
      event.clientY === this.lastMotionEventY &&
      now - this.lastMotionEventAt < 12
    ) {
      return;
    }
    this.lastMotionEventAt = now;
    this.lastMotionEventX = event.clientX;
    this.lastMotionEventY = event.clientY;
    if (!this.engine || !this.config.enabled || this.manualPause) return;
    const target = event.target;
    if (target instanceof Node && this.panel.contains(target)) {
      this.lastPointer = null;
      return;
    }

    const routeIsBlog = location.pathname.startsWith("/blog");
    const readingTarget =
      target instanceof Element &&
      Boolean(target.closest("article, .article, .prose, pre, code, input, textarea, [contenteditable]"));
    const nextSuppressed = routeIsBlog && readingTarget;
    if (nextSuppressed !== this.readingSuppressed) {
      this.readingSuppressed = nextSuppressed;
      this.applyEffectiveConfig();
    }
    if (this.readingSuppressed) {
      this.lastPointer = null;
      return;
    }

    this.pendingPointer = event;
    if (this.inputFrame) return;
    this.inputFrame = requestAnimationFrame(this.flushPointer);
  };

  private readonly flushPointer = (): void => {
    this.inputFrame = 0;
    const event = this.pendingPointer;
    this.pendingPointer = null;
    if (!event || !this.engine) return;
    const now = performance.now();
    const x = clamp(event.clientX / Math.max(1, innerWidth), 0, 1);
    const y = clamp(event.clientY / Math.max(1, innerHeight), 0, 1);
    const previous = this.lastPointer;
    this.lastPointer = { x, y, at: now };
    if (!previous || now - previous.at > 180) return;

    const dt = Math.max(8, now - previous.at);
    const pixelDx = (x - previous.x) * innerWidth;
    const pixelDy = (y - previous.y) * innerHeight;
    const speed = Math.hypot(pixelDx, pixelDy) / dt;
    const canSignal = speed >= this.preset.config.signalThreshold && now >= this.signalCooldownUntil;
    if (canSignal) this.signalCooldownUntil = now + 620;
    this.pointerInputCount += 1;
    const distance = Math.hypot(pixelDx, pixelDy);
    const spacing = Math.max(10, Math.min(innerWidth, innerHeight) * this.config.radius * 0.34);
    const steps = clamp(Math.ceil(distance / spacing), 1, 8);
    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      this.engine.inject({
        x: previous.x + (x - previous.x) * progress,
        y: previous.y + (y - previous.y) * progress,
        dx: (x - previous.x) / steps,
        dy: (y - previous.y) / steps,
        speed,
        signal: canSignal && step === steps
      });
    }
  };

  private readonly onPointerLeave = (): void => {
    this.lastPointer = null;
    this.pendingPointer = null;
    this.readingSuppressed = false;
    this.applyEffectiveConfig();
  };

  private readonly onPanelInput = (event: Event): void => {
    const control = event.target;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    const key = control.dataset.shadowConfig;
    if (!key) return;
    if (key === "preset") {
      this.setPreset(control.value as ShadowInkPresetName);
      return;
    }
    if (key === "beforeAfter") {
      this.root.classList.toggle("is-before", (control as HTMLInputElement).checked);
      return;
    }
    if (key === "enabled") {
      this.config.enabled = (control as HTMLInputElement).checked;
    } else if (key === "quality") {
      this.config.quality = control.value as ShadowInkQuality;
    } else if (key === "layer") {
      this.config.layer = control.value as ShadowInkLayer;
    } else if (key === "blend") {
      this.config.blend = control.value as ShadowInkBlend;
    } else if (key in this.config) {
      (this.config as unknown as Record<string, number>)[key] = Number(control.value);
    }
    const output = this.panel.querySelector<HTMLOutputElement>(`[data-shadow-output="${key}"]`);
    if (output) output.value = Number(control.value).toFixed(key === "curl" ? 0 : 2);
    this.applyEffectiveConfig();
  };

  private readonly onPanelClick = (event: MouseEvent): void => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button") : null;
    const action = button?.dataset.shadowAction;
    if (!button || !action) return;
    if (action === "collapse") {
      const collapsed = this.panel.classList.toggle("is-collapsed");
      this.setPanelCollapsed(collapsed);
    }
    if (action === "clear") this.engine?.clear();
    if (action === "reset") this.setPreset(presetForPath(location.pathname).name);
  };

  private readonly updateRouteBound = (): void => this.updateRoute();

  private readonly onBeforeSwap = (): void => {
    this.lastPointer = null;
    this.pendingPointer = null;
    this.engine?.pause("manual");
  };

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) {
      this.engine?.pause("hidden");
      this.lastPointer = null;
    } else if (!this.manualPause) {
      this.engine?.resume();
    }
  };

  private readonly onWindowBlur = (): void => {
    this.engine?.pause("blur");
    this.lastPointer = null;
  };

  private readonly onWindowFocus = (): void => {
    this.lastPointer = null;
    if (!this.manualPause && !document.hidden) this.engine?.resume();
  };

  private readonly onResize = (): void => {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      this.resizeTimer = 0;
      this.lastPointer = null;
      this.engine?.resize();
    }, 160);
  };

  private readonly onCapabilityChange = (): void => {
    this.lastPointer = null;
    this.forceMotionActive = this.canForceMotion(this.forceMotionRequested);
    this.applyCapabilities();
  };
}

function mountIfRequested(): void {
  const request = requestedMode();
  if (request.mode === "off") {
    window[GLOBAL_KEY]?.destroy();
    delete window[GLOBAL_KEY];
    return;
  }
  if (request.mode === "none") return;
  const host = getHost();
  if (!host) return;
  if (window[GLOBAL_KEY]) {
    window[GLOBAL_KEY].updateRoute(request.forceMotion);
    return;
  }
  window[GLOBAL_KEY] = new ShadowInkDebugRuntime(host, request.forceMotion);
}

window.__rainDustShadowInkBootstrapCleanup?.();
const bootstrapAbort = new AbortController();

mountIfRequested();
document.addEventListener("astro:page-load", mountIfRequested, {
  signal: bootstrapAbort.signal,
});

window.__rainDustShadowInkBootstrapCleanup = () => {
  bootstrapAbort.abort();
  window[GLOBAL_KEY]?.destroy();
  delete window[GLOBAL_KEY];
  delete window.__rainDustShadowInkBootstrapCleanup;
};

const hotModule = (import.meta as ImportMeta & {
  hot?: { dispose(callback: () => void): void };
}).hot;

if (hotModule) {
  hotModule.dispose(() => {
    window.__rainDustShadowInkBootstrapCleanup?.();
  });
}
