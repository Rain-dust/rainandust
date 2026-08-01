export type PrototypePageId = "home" | "projects" | "blog" | "about";
export type PrototypePageTone = "paper" | "architecture" | "editorial" | "profile";
export type PrototypeDirection = `${PrototypePageId}-to-${PrototypePageId}`;

export interface PrototypePage {
  id: PrototypePageId;
  tone: PrototypePageTone;
}

export interface PrototypeRouteMatch {
  from: string;
  to: string;
  direction: PrototypeDirection;
  fromPage: PrototypePage;
  toPage: PrototypePage;
}

const MAIN_PAGES: Record<string, PrototypePage> = {
  "/": { id: "home", tone: "paper" },
  "/projects/": { id: "projects", tone: "architecture" },
  "/blog/": { id: "blog", tone: "editorial" },
  "/about/": { id: "about", tone: "profile" }
};

export function normalizePrototypePath(input: URL | string): string {
  const url = input instanceof URL ? input : new URL(input, window.location.origin);
  if (url.pathname === "/") return "/";
  return `${url.pathname.replace(/\/+$/, "")}/`;
}

export function matchPrototypeRoute(
  fromInput: URL | string,
  toInput: URL | string
): PrototypeRouteMatch | null {
  const fromUrl = fromInput instanceof URL ? fromInput : new URL(fromInput, window.location.origin);
  const toUrl = toInput instanceof URL ? toInput : new URL(toInput, window.location.origin);
  if (fromUrl.origin !== toUrl.origin) return null;

  const from = normalizePrototypePath(fromUrl);
  const to = normalizePrototypePath(toUrl);
  if (from === to) return null;
  const fromPage = MAIN_PAGES[from];
  const toPage = MAIN_PAGES[to];
  if (!fromPage || !toPage) return null;
  return {
    from,
    to,
    fromPage,
    toPage,
    direction: `${fromPage.id}-to-${toPage.id}`
  };
}

export function getPrototypePage(input: URL | string): PrototypePage | null {
  return MAIN_PAGES[normalizePrototypePath(input)] ?? null;
}

export function isCompatibilityRedirectPath(input: URL | string): boolean {
  const path = normalizePrototypePath(input);
  return path === "/works/" || path === "/me/";
}
