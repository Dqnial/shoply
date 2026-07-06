import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/types";

/**
 * Shared "redirect home unless logged in (and, optionally, unless `predicate`
 * passes)" guard — the profile and admin layouts each hand-rolled this same
 * effect + loading-spinner gate. Pass a predicate (e.g. `(u) => u.isAdmin`)
 * for stricter guards; omit it to just require a logged-in user.
 */
export function useRequireAuth(predicate?: (user: User) => boolean) {
  const { user, isChecking } = useAuthStore();
  const router = useRouter();

  const authorized = !!user && (!predicate || predicate(user));

  useEffect(() => {
    if (!isChecking && !authorized) {
      router.push("/");
    }
    // Only re-run when the underlying auth state settles — re-running just
    // because the caller passed a new inline predicate function would cause
    // an extra, pointless effect firing on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isChecking, router]);

  return { user, isChecking, authorized };
}
