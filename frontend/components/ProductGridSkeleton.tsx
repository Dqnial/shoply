import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col w-full">
          <div className="relative aspect-square overflow-hidden rounded-2xl">
            <Skeleton className="h-full w-full" />
          </div>

          <div className="mt-3 px-1 space-y-1">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-3/4 rounded-md" />

              <Skeleton className="h-3 w-1/4 rounded-sm" />
            </div>

            <div className="pt-0.5">
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
