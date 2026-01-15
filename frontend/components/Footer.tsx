import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-card text-foreground border-t border-border py-16 mt-20 pb-32 md:pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <h3 className="text-3xl font-black tracking-tighter text-primary">
              SHOPLY.
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Твой премиальный магазин электроники. Только сертифицированные
              товары и лучший сервис в 2026 году.
            </p>
            <div className="flex gap-4">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Icon size={20} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Покупателям</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {[
                "Доставка",
                "Гарантия",
                "Возврат товара",
                "Способы оплаты",
                "Частые вопросы",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Компания</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {[
                "О нас",
                "Контакты",
                "Вакансии",
                "Блог",
                "Партнерская программа",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="font-bold text-lg mb-6">Контакты</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <Mail size={18} className="text-primary" />
                <span>support@shoply.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <Phone size={18} className="text-primary" />
                <span>8 (800) 555-35-35</span>
              </div>
            </div>
            <div className="pt-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-medium text-primary mb-1">
                  Режим работы
                </p>
                <p className="text-xs text-muted-foreground">
                  Пн-Вс: 09:00 — 21:00
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          <p>© 2026 Shoply Inc. Все права защищены.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors">
              Политика конфиденциальности
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Публичная оферта
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
