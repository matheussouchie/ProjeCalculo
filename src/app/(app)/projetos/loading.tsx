import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>
        <Skeleton className="hidden h-10 w-56 sm:block" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
