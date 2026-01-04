"use client";
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const SLIDES = [
  {
    id: 1,
    title: "IPHONE 17",
    desc: "Титановый корпус. Невероятная камера. Самый мощный чип в истории.",
    image: "/apple-iphone-17-golden.png",
    price: "от 599 990 ₸",
    bg: "bg-[#0a0a0a]",
    glow: "bg-amber-500/20",
    accent: "text-amber-500",
  },
  {
    id: 2,
    title: "MACBOOK AIR M3",
    desc: "Тонкий. Мощный. Создан для работы и творчества в любом месте.",
    image: "/hero_large.png",
    price: "от 725 000 ₸",
    bg: "bg-[#050a15]",
    glow: "bg-blue-600/20",
    accent: "text-blue-500",
  },
];

export default function HeroSlider() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000 }),
  ]);

  return (
    <section className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {SLIDES.map((slide) => (
          <div
            key={slide.id}
            className={`flex-[0_0_100%] min-w-0 relative h-[420px] md:h-[550px] border-b border-white/5 ${slide.bg} transition-colors duration-700`}
          >
            <div className="container mx-auto px-6 h-full flex flex-col md:flex-row items-center justify-between gap-10 py-10">
              <div className="z-10 w-full md:w-[60%] text-center md:text-left space-y-5">
                <span
                  className={`inline-block px-4 py-1.5 bg-white/5 ${slide.accent} backdrop-blur-md rounded-full text-[11px] md:text-xs font-bold tracking-[0.2em] border border-white/10`}
                >
                  {slide.price}
                </span>

                <h1 className="text-5xl md:text-[84px] font-black tracking-tighter uppercase leading-[0.85] text-white">
                  {slide.title}
                </h1>

                <p className="text-base md:text-lg text-zinc-400 font-medium max-w-lg leading-relaxed">
                  {slide.desc}
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                  <Button
                    size="lg"
                    className="bg-white text-black cursor-pointer hover:bg-zinc-200 px-10 py-7 text-base font-bold rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
                  >
                    Купить сейчас
                  </Button>
                </div>
              </div>

              <div className="relative w-full md:w-[40%] h-[250px] md:h-[450px] flex items-center justify-center">
                <div
                  className={`absolute w-[250px] md:w-[400px] h-[250px] md:h-[400px] ${slide.glow} blur-[100px] rounded-full animate-pulse`}
                />

                <div className="relative w-full h-full transform hover:scale-110 transition-transform duration-1000 ease-out">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)] scale-100"
                    priority
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
