const themeRoot = "/themes/fuyukawa-kagari";

export function kagariAsset(path: string) {
  return `${themeRoot}/assets/${path.replace(/^\/+/, "")}`;
}

export const kagariAssets = {
  scrollPig: kagariAsset("scroll-chibi.png"),
  profile: "/rain-dust/me/rain-dust-avatar-20260729.jpg",
  homeVideo: "/rain-dust/home/shadow-home-loop.mp4",
  homePoster: "/rain-dust/home/shadow-home-poster.jpg",
  heroWallpaper: kagariAsset("hero-wallpaper-20260729.png"),
  pageBackground: kagariAsset("fuyukawa-kagari-bg.webp"),
  notFound: kagariAsset("legacy/404.webp"),
  musicManifest: `${themeRoot}/music/manifest.json`
} as const;
