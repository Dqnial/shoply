"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// There's no newsletter backend yet — this at least gives honest feedback
// on submit instead of a button that silently does nothing.
export default function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.info("Рассылка скоро появится — спасибо за интерес!");
    setEmail("");
  };

  return (
    <section className="container mx-auto px-4">
      <div className="bg-primary rounded-[40px] p-12 text-center text-primary-foreground space-y-6 relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <h2 className="text-4xl font-black">Узнавайте о скидках первым</h2>
        <p className="max-w-md mx-auto opacity-90">
          Подпишитесь на рассылку и получите секретный промокод на первую
          покупку.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto relative z-10"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ваш email"
            className="flex-1 px-6 py-4 rounded-2xl bg-primary-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <Button
            type="submit"
            size="lg"
            variant="secondary"
            className="cursor-pointer py-6 rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            Подписаться
          </Button>
        </form>
      </div>
    </section>
  );
}
