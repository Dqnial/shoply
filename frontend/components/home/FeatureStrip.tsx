import { Truck, ShieldCheck, RefreshCcw, Headset } from "lucide-react";

const FEATURES = [
  { icon: <Truck />, title: "Доставка", desc: "Бесплатно от 5000 ₸" },
  {
    icon: <ShieldCheck />,
    title: "Гарантия",
    desc: "2 года от производителя",
  },
  { icon: <RefreshCcw />, title: "Возврат", desc: "30 дней на обмен" },
  { icon: <Headset />, title: "Поддержка", desc: "Круглосуточно 24/7" },
];

export default function FeatureStrip() {
  return (
    <section className="container mx-auto px-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 p-8 bg-card rounded-3xl border border-border">
        {FEATURES.map((item, i) => (
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
  );
}
