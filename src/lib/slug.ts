export function normalizeSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function decodeSlugParam(input: string) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}
