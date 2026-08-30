// Resolves the CMS page matching a catch-all route's URL segments, by
// aliasing on the first path segment. Port of cricfeed's
// utils/navigation.ts/resolvePageFromSlug -- kept as one implementation so
// the [...slug] route and any future call sites can't drift.
export function resolvePageFromAlias(pages, slug) {
  if (!pages || pages.length === 0 || !slug || slug.length === 0) return null;
  const alias = `/${slug[0]}`;
  return (
    pages.find((page) => {
      const pageAlias = page.alias?.startsWith("/") ? page.alias : `/${page.alias}`;
      return pageAlias === alias;
    }) ?? null
  );
}
