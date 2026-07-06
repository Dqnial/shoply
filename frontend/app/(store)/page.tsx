import axios from "axios";
import { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HeroSlider from "@/components/product/HeroSlider";
import FeatureStrip from "@/components/home/FeatureStrip";
import CategoryGrid from "@/components/home/CategoryGrid";
import NewsletterSection from "@/components/home/NewsletterSection";

// This fetches live product data, so it must run per-request rather than
// being baked into the static HTML at build time — with Docker Compose in
// particular, the backend isn't reachable yet while the frontend image is
// being built, which would otherwise freeze this section empty forever.
export const dynamic = "force-dynamic";

// This runs server-side, inside the same process as the Express API
// (backend/src/server.ts calls next() programmatically) — so it can't use a
// relative "/api" path the way browser requests do; there's no "current
// origin" concept for a server-side fetch. It loops back to the server's
// own port instead.
const SERVER_API_URL =
  process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;

async function getProducts() {
  try {
    const { data } = await axios.get(`${SERVER_API_URL}/api/products`);

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.products)) return data.products;

    return [];
  } catch (err) {
    console.error("Ошибка при загрузке товаров:", err);
    return [];
  }
}

export default async function HomePage() {
  const products: Product[] = await getProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col gap-16 pb-20 bg-background">
      <HeroSlider />

      <FeatureStrip />

      <CategoryGrid />

      <section className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-foreground">Хиты продаж</h2>
            <p className="text-muted-foreground">
              Товары, которые выбирают чаще всего
            </p>
          </div>
          <Button
            variant="ghost"
            asChild
            className="gap-2 group text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
          >
            <Link href="/catalog">
              Смотреть все
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
}
