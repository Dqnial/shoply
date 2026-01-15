import api from "@/lib/axios";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import {
  Truck,
  ShieldCheck,
  RefreshCcw,
  Headset,
  ChevronRight,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";

async function getProducts() {
  try {
    const { data } = await api.get("/products");

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

      <section className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 p-8 bg-card rounded-3xl border border-border">
          {[
            { icon: <Truck />, title: "Доставка", desc: "Бесплатно от 5000 ₸" },
            {
              icon: <ShieldCheck />,
              title: "Гарантия",
              desc: "2 года от производителя",
            },
            {
              icon: <RefreshCcw />,
              title: "Возврат",
              desc: "30 дней на обмен",
            },
            {
              icon: <Headset />,
              title: "Поддержка",
              desc: "Круглосуточно 24/7",
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                {item.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-black mb-10 text-foreground">
          Популярные категории
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              name: "Смартфоны",
              icon: <Smartphone size={32} />,
              color: "bg-primary/5 text-primary",
            },
            {
              name: "Ноутбуки",
              icon: <Laptop size={32} />,
              color: "bg-primary/5 text-primary",
            },
            {
              name: "Часы",
              icon: <Watch size={32} />,
              color: "bg-primary/5 text-primary",
            },
            {
              name: "Аудио",
              icon: <Headphones size={32} />,
              color: "bg-primary/5 text-primary",
            },
          ].map((cat, i) => (
            <Link
              href={`/catalog?category=${cat.name}`}
              key={i}
              className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all"
            >
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}
              >
                {cat.icon}
              </div>
              <span className="font-bold text-foreground">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

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

      <section className="container mx-auto px-4">
        <div className="bg-primary rounded-[40px] p-12 text-center text-primary-foreground space-y-6 relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <h2 className="text-4xl font-black">Узнавайте о скидках первым</h2>
          <p className="max-w-md mx-auto opacity-90">
            Подпишитесь на рассылку и получите секретный промокод на первую
            покупку.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative z-10">
            <input
              type="email"
              placeholder="Ваш email"
              className="flex-1 px-6 py-4 rounded-2xl bg-primary-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <Button
              size="lg"
              variant="secondary"
              className="cursor-pointer py-6 rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              Подписаться
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
