"use client";

import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChecking, authorized } = useRequireAuth((user) => user.isAdmin);

  if (isChecking || !authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        {/* Visible only on mobile (md:hidden) — the sidebar's own trigger is
            unreachable until the off-canvas panel is already open, so a
            way to open it has to live outside the sidebar itself. On
            desktop, the sidebar's built-in header trigger + rail handle it. */}
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center border-b border-border bg-background/80 px-3 backdrop-blur-sm md:hidden">
          <SidebarTrigger className="cursor-pointer" />
        </header>
        <div className="flex-1 bg-background">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
