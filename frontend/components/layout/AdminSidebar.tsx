"use client";

import * as React from "react";
import { LayoutDashboard, Box, ShoppingCart, Users, ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Дашборд", url: "/admin", icon: LayoutDashboard },
  { title: "Товары", url: "/admin/products", icon: Box },
  { title: "Заказы", url: "/admin/orders", icon: ShoppingCart },
  { title: "Пользователи", url: "/admin/users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-3">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 rounded-lg p-1 transition-colors hover:bg-sidebar-accent"
        >
          <div className="flex min-w-0 flex-col gap-0.5 leading-none">
            <span className="truncate text-2xl font-black text-primary tracking-tighter">
              SHOPLY.
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Admin Panel
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
            Управление
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className="cursor-pointer"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="cursor-pointer">
              <Link href="/">
                <ArrowLeft />
                <span>На сайт</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
