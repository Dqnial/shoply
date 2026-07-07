// Remembers the last full catalog URL (filters + sort + page, all of which
// live in the query string) so nav links back to "Каталог" can restore it
// instead of always landing on a bare, filter-less /catalog. Plain module
// state, not React state — nothing needs to re-render when this changes,
// it only needs to be read fresh at the moment a nav link is clicked.
let rememberedCatalogUrl = "/catalog";

export function setRememberedCatalogUrl(url: string) {
  rememberedCatalogUrl = url;
}

export function getRememberedCatalogUrl() {
  return rememberedCatalogUrl;
}
