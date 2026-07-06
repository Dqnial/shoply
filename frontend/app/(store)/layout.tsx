import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </>
  );
}
