"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

// sonner's <Toaster> doesn't know about the app's theme unless told — left
// unset, it always renders light, even in dark mode.
export default function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        className: "mb-[calc(70px+env(safe-area-inset-bottom))] md:mb-0",
      }}
    />
  );
}
