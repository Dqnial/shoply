import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// Module-level, not state — needs to survive across client-side navigations
// without re-rendering anything, and only needs to live as long as the tab
// does (a hard refresh naturally resetting it matches normal web behavior).
const scrollPositions = new Map<string, number>();

/**
 * Restores each route's scroll position when navigating back to it, and
 * remembers the outgoing route's position before leaving — the web
 * approximation of how native app tab bars keep every tab's scroll state.
 * Mount this once, high enough in the tree to survive navigation between
 * the routes that should feel this way (see ScrollRestoration.tsx).
 */
export function useScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.set(pathname, window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Runs before paint so there's no visible flash at the top before jumping
  // to the restored position.
  useLayoutEffect(() => {
    window.scrollTo(0, scrollPositions.get(pathname) ?? 0);
  }, [pathname]);
}
