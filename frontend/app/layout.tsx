import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthInitializer from "@/components/AuthInitializer";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shoply — Магазин электроники",
  description: "Лучшие товары на Next.js",
  icons: {
    icon: [{ url: "/icon.png?v=1", type: "image/png" }],
    apple: [
      { url: "/apple-icon.png?v=1", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.className}>
      <body>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
        <AuthInitializer>
          <Toaster
            toastOptions={{
              className: "mb-[calc(70px+env(safe-area-inset-bottom))] md:mb-0",
            }}
          />
          <Navbar />
          <main className="flex-grow pt-20">{children}</main>
          <Footer />
        </AuthInitializer>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
