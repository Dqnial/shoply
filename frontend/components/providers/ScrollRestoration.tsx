"use client";

import { useScrollRestoration } from "@/hooks/useScrollRestoration";

// Side-effect-only leaf so the (store) layout above it can stay a server
// component — only this one small piece needs to be a client component.
export default function ScrollRestoration() {
  useScrollRestoration();
  return null;
}
