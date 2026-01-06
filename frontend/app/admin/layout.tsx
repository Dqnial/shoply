"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isChecking } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isChecking && (!user || !user.isAdmin)) {
      router.push("/");
    }
  }, [user, isChecking, router]);

  if (isChecking || !user || !user.isAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentTab =
    pathname === "/admin" ? "dashboard" : pathname.split("/").pop();

  return (
    <div className="w-full bg-background">
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <Tabs value={currentTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-4 bg-muted/50">
              <Link href="/admin" className="w-full">
                <TabsTrigger value="dashboard" className="w-full">
                  Дашборд
                </TabsTrigger>
              </Link>

              <Link href="/admin/products" className="w-full">
                <TabsTrigger value="products" className="w-full">
                  Товары
                </TabsTrigger>
              </Link>

              <Link href="/admin/orders" className="w-full">
                <TabsTrigger value="orders" className="w-full">
                  Заказы
                </TabsTrigger>
              </Link>

              <Link href="/admin/users" className="w-full">
                <TabsTrigger value="users" className="w-full">
                  Пользователи
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 min-h-[60vh]">{children}</div>
    </div>
  );
}
