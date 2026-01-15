import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="space-y-1 mb-10">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </aside>

        <div className="lg:col-span-9">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col bg-transparent w-full">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
                  <Skeleton className="h-full w-full" />
                </div>

                <div className="mt-3 px-1 space-y-1">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                    <Skeleton className="h-3 w-1/4 rounded-sm" />
                  </div>

                  <div className="pt-0.5">
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
