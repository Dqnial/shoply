import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollRestoration from "@/components/providers/ScrollRestoration";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ScrollRestoration />
      <Navbar />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </>
  );
}
