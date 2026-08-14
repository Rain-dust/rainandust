const themeRoot = "/themes/fuyukawa-kagari";

export function kagariAsset(path: string) {
  return `${themeRoot}/assets/${path.replace(/^\/+/, "")}`;
}

export const kagariAssets = {
  favicon: kagariAsset("avatar-sigil.png"),
  appleTouchIcon: kagariAsset("avatar-sigil.png"),
  scrollPig: kagariAsset("scroll-chibi.png"),
  profile: "/rain-dust/me/rain-dust-avatar-20260729.jpg",
  heroWallpaper: kagariAsset("hero-wallpaper-20260729.png"),
  pageBackground: kagariAsset("fuyukawa-kagari-bg.webp"),
  notFound: kagariAsset("legacy/404.webp")
} as const;
