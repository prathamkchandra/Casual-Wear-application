const BROKEN_UNSPLASH_IDS = [
  "1617952236317-12bc3c0d8d8a",
  "1506629905607-b6f2b7e9f13d",
  "1565693413579-8f0b0f31f240",
];

export const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80";

export function isBrokenRemoteImage(src?: string | null) {
  if (!src) return false;
  return BROKEN_UNSPLASH_IDS.some((id) => src.includes(id));
}

export function getSafeProductImage(
  src?: string | null,
  fallback: string = DEFAULT_PRODUCT_IMAGE
) {
  if (!src || isBrokenRemoteImage(src)) return fallback;
  return src;
}
