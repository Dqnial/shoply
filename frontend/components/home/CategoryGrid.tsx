import Link from "next/link";
import { Smartphone, Laptop, Watch, Headphones } from "lucide-react";

const CATEGORIES = [
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
    name: "Наушники",
    icon: <Headphones size={32} />,
    color: "bg-primary/5 text-primary",
  },
];

export default function CategoryGrid() {
  return (
    <section className="container mx-auto px-4 text-center">
      <h2 className="text-3xl font-black mb-10 text-foreground">
        Популярные категории
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, i) => (
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
  );
}
