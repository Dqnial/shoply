import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import api from "@/lib/axios";
import { useDebounce } from "@/hooks/useDebounce";
import { Product } from "@/types";

const ITEMS_PER_PAGE = 6;

/**
 * Owns every piece of catalog state: URL-derived filters, the debounced text
 * inputs that shadow them, the two-way sync between the two, and the
 * category/brand/product queries. Leaves the page component to just render.
 */
export function useCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "all";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "newest";
  const currentPage = Number(searchParams.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  const debouncedSearch = useDebounce(searchInput);
  const debouncedMinPrice = useDebounce(minPriceInput);
  const debouncedMaxPrice = useDebounce(maxPriceInput);

  const filtersQuery = useQuery({
    queryKey: ["product-filters", { search, category, brand }],
    queryFn: async () => {
      const { data } = await api.get("/products/filters", {
        params: { search, category, brand },
      });
      return data as { categories: string[]; brands: string[] };
    },
  });

  const productsQuery = useQuery({
    queryKey: [
      "products",
      { page: currentPage, search, category, brand, minPrice, maxPrice, sortBy },
    ],
    queryFn: async () => {
      const { data } = await api.get("/products", {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search,
          category,
          brand,
          minPrice,
          maxPrice,
          sortBy,
        },
      });
      return data as { products: Product[]; totalCount: number };
    },
    placeholderData: keepPreviousData,
  });

  const products = productsQuery.data?.products ?? [];
  const totalCount = productsQuery.data?.totalCount ?? 0;
  const availableCategories = filtersQuery.data?.categories ?? [];
  const availableBrands = filtersQuery.data?.brands ?? [];

  const isInitialLoading = productsQuery.isPending;
  const loading =
    productsQuery.isPending ||
    (productsQuery.isFetching && productsQuery.isPlaceholderData);

  const updateFilters = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      if (name !== "page") {
        params.set("page", "1");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // resetFilters clears the URL instantly, but the debounced values below
  // don't know that happened yet — they still hold whatever was typed until
  // their own timer catches up. Without this guard, the sync effects below
  // see a stale debounced value that no longer matches the (already-cleared)
  // URL and push it right back, causing a reset-then-snap-back flicker.
  const skipNextSyncRef = useRef({ search: false, minPrice: false, maxPrice: false });

  useEffect(() => {
    if (skipNextSyncRef.current.search) {
      skipNextSyncRef.current.search = false;
      return;
    }
    if (debouncedSearch !== search) {
      updateFilters("search", debouncedSearch);
    }
  }, [debouncedSearch, search, updateFilters]);

  useEffect(() => {
    if (skipNextSyncRef.current.minPrice) {
      skipNextSyncRef.current.minPrice = false;
      return;
    }
    if (debouncedMinPrice !== minPrice) {
      updateFilters("minPrice", debouncedMinPrice);
    }
  }, [debouncedMinPrice, minPrice, updateFilters]);

  useEffect(() => {
    if (skipNextSyncRef.current.maxPrice) {
      skipNextSyncRef.current.maxPrice = false;
      return;
    }
    if (debouncedMaxPrice !== maxPrice) {
      updateFilters("maxPrice", debouncedMaxPrice);
    }
  }, [debouncedMaxPrice, maxPrice, updateFilters]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setMinPriceInput(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setMaxPriceInput(maxPrice);
  }, [maxPrice]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const resetFilters = useCallback(() => {
    skipNextSyncRef.current = { search: true, minPrice: true, maxPrice: true };
    router.push(pathname);
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
  }, [router, pathname]);

  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters("page", String(page));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateFilters]
  );

  return {
    // filter values (URL-derived)
    category,
    brand,
    sortBy,
    currentPage,
    totalPages,
    // debounced text inputs
    searchInput,
    setSearchInput,
    minPriceInput,
    setMinPriceInput,
    maxPriceInput,
    setMaxPriceInput,
    // data
    products,
    totalCount,
    availableCategories,
    availableBrands,
    isInitialLoading,
    loading,
    // actions
    updateFilters,
    resetFilters,
    handlePageChange,
  };
}
