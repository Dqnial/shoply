import { Skeleton } from "@/components/ui/skeleton";

export default function ProductSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <Skeleton className="h-10 w-24 mb-8 rounded-xl" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-card p-6 md:p-10 rounded-3xl border border-border shadow-sm">
        <div className="relative h-[400px] md:h-[600px] rounded-2xl overflow-hidden">
          <Skeleton className="h-full w-full" />
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-12 w-full md:w-3/4 mt-4" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="flex items-center gap-4 py-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>

          <div className="flex gap-3 pt-4">
            <Skeleton className="h-16 flex-1 rounded-2xl" />
            <Skeleton className="h-16 w-16 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
