/**
 * Supabase Storage Image Helper
 *
 * Ensures valid, directly accessible public URLs for Supabase and external images.
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
}

/**
 * Returns the reliable image URL.
 * We preserve the direct public URL to guarantee fast CDN delivery without
 * requiring paid Supabase image transformation add-ons.
 */
export const getOptimizedUrl = (
  url: string | null | undefined,
  _options?: ImageTransformOptions
): string => {
  if (!url) return "";
  return url;
};

/* ─── Preset helpers for common use cases ─── */

/** Profile photo thumbnail */
export const getProfileThumbnail = (url: string | null | undefined): string =>
  getOptimizedUrl(url);

/** Card thumbnail */
export const getCardThumbnail = (url: string | null | undefined): string =>
  getOptimizedUrl(url);

/** Gallery grid thumbnail */
export const getGalleryThumbnail = (url: string | null | undefined): string =>
  getOptimizedUrl(url);

/** Banner/hero image */
export const getBannerImage = (url: string | null | undefined): string =>
  getOptimizedUrl(url);

/** Full resolution */
export const getFullResolution = (url: string | null | undefined): string =>
  url || "";
