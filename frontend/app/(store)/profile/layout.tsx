"use client";

import { Loader2 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isChecking, authorized } = useRequireAuth();

  if (isChecking || !authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
