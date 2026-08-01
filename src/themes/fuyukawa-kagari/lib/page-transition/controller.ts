import {
  PageTransitionAdapter,
  type PrototypeRenderer,
  type TransitionMode
} from "./adapter";
import {
  getPrototypePage,
  matchPrototypeRoute,
  type PrototypeDirection,
  type PrototypeRouteMatch
} from "./routes";
type PrototypeState =
  | "Idle"
  | "Preparing"
  | "Covering"
  | "Covered"
  | "Swapping"
  | "Revealing"
  | "Completed"
  | "Reduced"
  | "Fallback"
  | "Failed"
  | "Cancelled";

interface PrototypeDebugState {
  enabled: boolean;
  state: PrototypeState;
  transactionId: number;
  from: string | null;
  to: string | null;
  direction: PrototypeDirection | null;
  originalMotion: "REDUCED" | "NORMAL";
  override: "ACTIVE" | "INACTIVE";
  renderer: PrototypeRenderer;
  canvasCount: number;
  engineCount: number;
  stageCount: number;
  activeRafCount: number;
  listenerGeneration: number;
  lastFailure: string | null;
  coverProgress: number;
  revealProgress: number;
}

interface TransitionPreparationEvent extends Event {
  from: URL;
  to: URL;
  direction: string;
  navigationType: "push" | "replace" | "traverse";
  loader: () => Promise<void>;
}

interface TransitionSwapEvent extends Event {
  from: URL;
  to: URL;
  direction: string;
  navigationType: "push" | "replace" | "traverse";
  newDocument: Document;
  viewTransition?: ViewTransition;
}

interface PrototypeSession {
  enabled: boolean;
  forceMotion: boolean;
}

interface PrototypeGlobal {
  getDebugState(): PrototypeDebugState;
  destroy(): void;
}

declare global {
  interface Window {
    __rainDustPageTransitionPrototype?: PrototypeGlobal;
    __rainDustPageTransitionBootstrapCleanup?: () => void;
    __rainDustPageTransitionListenerGeneration?: number;
    __rainDustShadowInkDebug?: { destroy(removeDom?: boolean): void };
    __rainDustShadowInkBootstrapCleanup?: () => void;
  }
}

const SESSION_KEY = "rain-dust-page-transition-prototype-v1";
const SHADOW_INK_SESSION_KEY = "rain-dust-shadow-ink-debug-v1";
const HOST_SELECTOR = "[data-page-transition-prototype-host]";
const DENSE_INK_PEAK_MS = 72;
const SNAPSHOT_WAIT_LIMIT_MS = 180;

function storageGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // The prototype can still run for the current document.
  }
}

function storageRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Storage access is optional for the development prototype.
  }
}

function requestedSession(): PrototypeSession {
  const params = new URLSearchParams(location.search);
  const request = params.get("page-transition");
  if (request === "off") {
    storageRemove(SESSION_KEY);
    return { enabled: false, forceMotion: false };
  }
  if (request === "prototype") {
    const session = {
      enabled: true,
      forceMotion: params.get("motion") === "force"
    };
    storageSet(SESSION_KEY, JSON.stringify(session));
    return session;
  }
  const stored = storageGet(SESSION_KEY);
  if (!stored) return { enabled: false, forceMotion: false };
  try {
    const parsed = JSON.parse(stored) as Partial<PrototypeSession>;
    return {
      enabled: parsed.enabled === true,
      forceMotion: parsed.forceMotion === true
    };
  } catch {
    storageRemove(SESSION_KEY);
    return { enabled: false, forceMotion: false };
  }
}

function disableShadowInkDebug(): void {
  storageRemove(SHADOW_INK_SESSION_KEY);
  window.__rainDustShadowInkDebug?.destroy();
  window.__rainDustShadowInkBootstrapCleanup?.();
}

class PageTransitionPrototypeController implements PrototypeGlobal {
  private readonly host: HTMLElement;
  private readonly lifecycle = new AbortController();
  private readonly reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  private readonly finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  private readonly listenerGeneration: number;
  private adapter: PageTransitionAdapter | null = null;
  private state: PrototypeState = "Idle";
  private transactionId = 0;
  private from: string | null = null;
  private to: string | null = null;
  private direction: PrototypeDirection | null = null;
  private currentMatch: PrototypeRouteMatch | null = null;
  private transitionMode: TransitionMode = "mask";
  private navigationType: string | null = null;
  private forceMotion = false;
  private lastFailure: string | null = null;
  private viewTransition: ViewTransition | null = null;
  private resizeTimer = 0;
  private peakTimer = 0;
  private destroyed = false;

  constructor(host: HTMLElement, session: PrototypeSession) {
    this.host = host;
    this.forceMotion = session.forceMotion;
    this.listenerGeneration = (window.__rainDustPageTransitionListenerGeneration ?? 0) + 1;
    window.__rainDustPageTransitionListenerGeneration = this.listenerGeneration;
    this.bind();
    this.adapter = new PageTransitionAdapter(this.host, this.canUseWebGl());
    this.startInitialReveal();
  }

  updateSession(session: PrototypeSession): void {
    const capabilityChanged = this.forceMotion !== session.forceMotion;
    this.forceMotion = session.forceMotion;
    if (capabilityChanged && this.state === "Idle") {
      this.adapter?.destroy();
      this.adapter = new PageTransitionAdapter(this.host, this.canUseWebGl());
    }
  }

  getDebugState(): PrototypeDebugState {
    const adapter = this.adapter?.getDiagnostics();
    return {
      enabled: !this.destroyed,
      state: this.state,
      transactionId: this.transactionId,
      from: this.from,
      to: this.to,
      direction: this.direction,
      originalMotion: this.reducedMotion.matches ? "REDUCED" : "NORMAL",
      override: this.forceMotion ? "ACTIVE" : "INACTIVE",
      renderer: adapter?.renderer ?? "CSS",
      canvasCount: document.querySelectorAll("[data-page-transition-canvas]").length,
      engineCount: adapter && adapter.renderer !== "CSS" ? 1 : 0,
      stageCount: document.querySelectorAll("[data-page-transition-stage]").length,
      activeRafCount: adapter?.activeRafCount ?? 0,
      listenerGeneration: this.listenerGeneration,
      lastFailure: this.lastFailure ?? adapter?.lastFailure ?? null,
      coverProgress: adapter?.coverProgress ?? 0,
      revealProgress: adapter?.revealProgress ?? 0
    };
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.state = "Cancelled";
    this.lifecycle.abort();
    if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
    if (this.peakTimer) window.clearTimeout(this.peakTimer);
    this.resizeTimer = 0;
    this.peakTimer = 0;
    this.adapter?.destroy();
    this.adapter = null;
    this.clearDocumentState();
    this.host.replaceChildren();
    if (window.__rainDustPageTransitionPrototype === this) {
      delete window.__rainDustPageTransitionPrototype;
    }
  }

  private bind(): void {
    const { signal } = this.lifecycle;
    document.addEventListener("astro:before-preparation", this.onBeforePreparation as EventListener, {
      signal
    });
    document.addEventListener("astro:after-preparation", this.onAfterPreparation, { signal });
    document.addEventListener("astro:before-swap", this.onBeforeSwap as EventListener, { signal });
    document.addEventListener("astro:after-swap", this.onAfterSwap, { signal });
    document.addEventListener("astro:page-load", this.onPageLoad, { signal });
    document.addEventListener("click", this.onClick, { capture: true, signal });
    document.addEventListener("visibilitychange", this.onVisibilityChange, { signal });
    window.addEventListener("resize", this.onResize, { passive: true, signal });
    window.addEventListener("pagehide", this.onPageHide, { signal });
  }

  private readonly onBeforePreparation = (event: TransitionPreparationEvent): void => {
    if (this.destroyed || this.state !== "Idle") return;
    const match = matchPrototypeRoute(event.from, event.to);
    if (!match) return;

    this.transactionId += 1;
    const transactionId = this.transactionId;
    this.from = match.from;
    this.to = match.to;
    this.direction = match.direction;
    this.currentMatch = match;
    this.transitionMode = this.modeForCurrentCapabilities();
    this.navigationType = event.navigationType;
    this.lastFailure = null;
    this.viewTransition = null;

    this.state = this.transitionMode === "reduced"
      ? "Reduced"
      : this.transitionMode === "fluid"
        ? "Preparing"
        : "Fallback";
    this.markDocumentState("covering", event.direction, match);
    document.dispatchEvent(new CustomEvent("rain-dust:transition-start", { detail: match }));
    const adapter = this.ensureAdapter();
    this.state = "Covering";
    const coverPromise = adapter.cover(match, this.transitionMode);
    const originalLoader = event.loader.bind(event);

    event.loader = async () => {
      try {
        await Promise.all([originalLoader(), coverPromise]);
        if (!this.isCurrent(transactionId)) return;
        this.state = "Covered";
        this.markDocumentState("covered", event.direction, match);
      } catch (error) {
        if (this.isCurrent(transactionId)) {
          this.state = "Failed";
          this.lastFailure = error instanceof Error ? error.message : String(error);
          await adapter.recover(match, this.transitionMode);
          this.finishTransaction(transactionId);
        }
        throw error;
      }
    };
  };

  private readonly onAfterPreparation = (): void => {
    if (this.state === "Covered") {
      document.documentElement.dataset.pageTransitionPhase = "covered";
    }
  };

  private readonly onBeforeSwap = (event: TransitionSwapEvent): void => {
    const match = matchPrototypeRoute(event.from, event.to);
    if (!this.direction || !this.currentMatch || !match) return;
    if (this.state !== "Covered") {
      this.adapter?.forceCovered();
      this.state = "Covered";
    }
    this.state = "Swapping";
    this.viewTransition = event.viewTransition ?? null;
    event.newDocument.documentElement.dataset.pageTransitionPrototype = "active";
    event.newDocument.documentElement.dataset.pageTransitionActive = "true";
    event.newDocument.documentElement.dataset.pageTransitionPhase = "covered";
    event.newDocument.documentElement.dataset.pageTransitionDirection = this.direction;
    event.newDocument.documentElement.dataset.pageTransitionFromTone = match.fromPage.tone;
    event.newDocument.documentElement.dataset.pageTransitionToTone = match.toPage.tone;
  };

  private readonly onAfterSwap = (): void => {
    if (this.state !== "Swapping" || !this.direction) return;
    const transactionId = this.transactionId;
    const snapshotFinished = this.viewTransition?.finished.catch(() => undefined) ?? Promise.resolve();
    const snapshotTimeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, SNAPSHOT_WAIT_LIMIT_MS);
    });
    const waitForSnapshots = Promise.race([snapshotFinished, snapshotTimeout]);
    void waitForSnapshots.then(() => {
      this.peakTimer = window.setTimeout(() => {
        this.peakTimer = 0;
        void this.startReveal(transactionId);
      }, DENSE_INK_PEAK_MS);
    });
  };

  private readonly onPageLoad = (): void => {
    if (this.state === "Completed") this.finishTransaction(this.transactionId);
  };

  private readonly onClick = (event: MouseEvent): void => {
    if (!this.isTransitioning()) return;
    const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!target) return;
    const url = new URL(target.href, location.href);
    if (url.origin !== location.origin) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) {
      this.adapter?.pause();
      if (this.isTransitioning()) this.adapter?.forceCovered();
      return;
    }
    this.adapter?.resume();
  };

  private readonly onResize = (): void => {
    if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      this.resizeTimer = 0;
      this.adapter?.resize();
    }, 160);
  };

  private readonly onPageHide = (): void => {
    this.adapter?.pause();
  };

  private ensureAdapter(): PageTransitionAdapter {
    if (!this.adapter) this.adapter = new PageTransitionAdapter(this.host, this.canUseWebGl());
    return this.adapter;
  }

  private async startReveal(transactionId: number): Promise<void> {
    if (!this.isCurrent(transactionId) || !this.direction || !this.currentMatch || !this.adapter) return;
    this.state = "Revealing";
    document.documentElement.dataset.pageTransitionPhase = "revealing";
    await this.adapter.reveal(this.currentMatch, this.transitionMode);
    if (!this.isCurrent(transactionId)) return;
    this.state = "Completed";
    this.finishTransaction(transactionId);
  }

  private finishTransaction(transactionId: number): void {
    if (!this.isCurrent(transactionId)) return;
    this.adapter?.reset();
    this.clearDocumentState();
    document.dispatchEvent(new CustomEvent("rain-dust:transition-end"));
    this.state = "Idle";
    this.host.dataset.transitionState = "Idle";
    this.host.dataset.transitionTransactionId = String(transactionId);
    this.from = null;
    this.to = null;
    this.direction = null;
    this.currentMatch = null;
    this.navigationType = null;
    this.viewTransition = null;
  }

  private markDocumentState(
    phase: string,
    astroDirection: string,
    match: PrototypeRouteMatch | null = this.currentMatch
  ): void {
    const root = document.documentElement;
    this.host.dataset.transitionState = this.state;
    this.host.dataset.transitionTransactionId = String(this.transactionId);
    this.host.dataset.transitionDirection = this.direction ?? astroDirection;
    root.dataset.pageTransitionPrototype = "active";
    root.dataset.pageTransitionActive = "true";
    root.dataset.pageTransitionPhase = phase;
    root.dataset.pageTransitionDirection = this.direction ?? astroDirection;
    if (match) {
      root.dataset.pageTransitionFromTone = match.fromPage.tone;
      root.dataset.pageTransitionToTone = match.toPage.tone;
    }
  }

  private clearDocumentState(): void {
    const root = document.documentElement;
    delete root.dataset.pageTransitionPrototype;
    delete root.dataset.pageTransitionActive;
    delete root.dataset.pageTransitionPhase;
    delete root.dataset.pageTransitionDirection;
    delete root.dataset.pageTransitionFromTone;
    delete root.dataset.pageTransitionToTone;
  }

  private isCurrent(transactionId: number): boolean {
    return !this.destroyed && transactionId === this.transactionId;
  }

  private isTransitioning(): boolean {
    return !["Idle", "Completed"].includes(this.state);
  }

  private canUseWebGl(): boolean {
    return this.finePointer.matches && (!this.reducedMotion.matches || this.forceMotion);
  }

  private modeForCurrentCapabilities(): TransitionMode {
    if (this.reducedMotion.matches && !this.forceMotion) return "reduced";
    return this.finePointer.matches ? "fluid" : "mask";
  }

  private startInitialReveal(): void {
    const page = getPrototypePage(location.href);
    if (!page || !this.adapter || this.destroyed) return;
    const transactionId = ++this.transactionId;
    this.transitionMode = this.modeForCurrentCapabilities();
    this.state = "Revealing";
    const root = document.documentElement;
    root.dataset.pageTransitionPrototype = "active";
    root.dataset.pageTransitionActive = "true";
    root.dataset.pageTransitionPhase = "revealing";
    root.dataset.pageTransitionFromTone = page.tone;
    root.dataset.pageTransitionToTone = page.tone;
    this.host.dataset.transitionState = this.state;
    this.host.dataset.transitionTransactionId = String(transactionId);
    document.dispatchEvent(new CustomEvent("rain-dust:transition-start"));
    void this.adapter.initialReveal(page, this.transitionMode).then(() => {
      if (!this.isCurrent(transactionId)) return;
      this.state = "Completed";
      this.finishTransaction(transactionId);
    });
  }
}

function getHost(): HTMLElement | null {
  return document.querySelector<HTMLElement>(HOST_SELECTOR);
}

function syncPrototype(): void {
  const session = requestedSession();
  if (!session.enabled) {
    window.__rainDustPageTransitionPrototype?.destroy();
    return;
  }
  disableShadowInkDebug();
  const host = getHost();
  if (!host) return;
  const existing = window.__rainDustPageTransitionPrototype;
  if (existing instanceof PageTransitionPrototypeController) {
    existing.updateSession(session);
    return;
  }
  window.__rainDustPageTransitionPrototype = new PageTransitionPrototypeController(host, session);
}

window.__rainDustPageTransitionBootstrapCleanup?.();
const bootstrapLifecycle = new AbortController();
syncPrototype();
document.addEventListener("astro:page-load", syncPrototype, {
  signal: bootstrapLifecycle.signal
});

window.__rainDustPageTransitionBootstrapCleanup = () => {
  bootstrapLifecycle.abort();
  window.__rainDustPageTransitionPrototype?.destroy();
  delete window.__rainDustPageTransitionBootstrapCleanup;
};

const hotModule = (import.meta as ImportMeta & {
  hot?: { dispose(callback: () => void): void };
}).hot;
hotModule?.dispose(() => window.__rainDustPageTransitionBootstrapCleanup?.());
