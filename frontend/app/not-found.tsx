import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-[12rem] font-bold leading-none text-muted-foreground/10 select-none">
        404
      </h1>

      <div className="mt-[-2rem] space-y-6">
        <h2 className="text-2xl font-semibold">Упс! Страница не найдена</h2>

        <Button
          asChild
          className="rounded-xl px-8 h-12 font-bold uppercase tracking-widest text-xs"
        >
          <Link href="/">Вернуться на главную</Link>
        </Button>
      </div>
    </div>
  );
}
