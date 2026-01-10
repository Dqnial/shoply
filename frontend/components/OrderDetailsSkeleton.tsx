import { Skeleton } from "@/components/ui/skeleton";

export default function OrderDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-1 mb-10">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <Skeleton className="h-4 w-56 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-6 bg-card p-4 rounded-2xl border border-border/60">
              <Skeleton className="relative w-24 h-24 rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-7 w-3/4 rounded-lg" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-12 rounded" />
                  <div className="w-1 h-1 rounded-full bg-muted shrink-0" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              </div>
              <div className="text-right shrink-0">
                <Skeleton className="h-6 w-24 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24 rounded" />
                <Skeleton className="h-4 w-full rounded" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-28 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-28">
          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-3 w-24 rounded" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="h-px bg-border my-4" />
              <div className="flex justify-between items-end">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>
            </div>
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="h-3 w-32 mx-auto rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
