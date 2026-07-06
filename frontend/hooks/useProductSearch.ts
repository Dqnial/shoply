import * as React from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import type { Product } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Owns the command-palette search modal's state: open/close (incl. the
 * global ⌘K shortcut), debounced fetch (with a request-id guard against
 * out-of-order responses), and Mac-detection for the shortcut label.
 */
export function useProductSearch() {
  const [open, setOpen] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isMac, setIsMac] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  // Guards against an older, slower request resolving after a newer one and
  // overwriting its results (e.g. typing quickly re-triggers the debounce).
  const latestRequestId = React.useRef(0);

  const fetchProducts = React.useCallback(async (query: string) => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    try {
      const { data } = await api.get<{ products: Product[] }>("/products", {
        params: { search: query, limit: 8 },
      });
      if (requestId !== latestRequestId.current) return;
      setProducts(data.products);
    } catch (error) {
      console.error("Search fetch error:", error);
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  }, []);

  const debouncedSearchValue = useDebounce(searchValue, 300);

  React.useEffect(() => {
    if (open) {
      fetchProducts(debouncedSearchValue);
    }
  }, [debouncedSearchValue, open, fetchProducts]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "л") &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return {
    open,
    setOpen,
    products,
    searchValue,
    setSearchValue,
    loading,
    isMac,
    router,
    runCommand,
  };
}
