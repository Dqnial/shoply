import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function OrdersSkeleton() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-2 mb-10">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-4 w-80 rounded-lg" />
      </div>

      <div className="flex flex-col gap-8">
        <Card className="rounded-[2.5rem] border-none bg-secondary/20 shadow-none overflow-hidden">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Skeleton className="w-20 h-20 rounded-[1.5rem]" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
            <Skeleton className="h-8 w-40 rounded-xl" />
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none bg-secondary/20 shadow-none">
          <CardHeader className="pt-8 px-8">
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="p-8 pt-2">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-background rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-transparent"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto md:gap-8 pt-4 md:pt-0 border-t md:border-none">
                    <div className="space-y-2 flex flex-col items-start md:items-end">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-16 rounded-lg" />
                    </div>
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
