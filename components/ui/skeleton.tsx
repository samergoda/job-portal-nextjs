import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-6 w-3/4" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-1.5 h-4 w-5/6" />
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function CompanyCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card p-6">
      <div className="flex flex-col items-center">
        <Skeleton className="h-14 w-14 rounded-lg" />
        <Skeleton className="mt-3 h-5 w-28" />
        <Skeleton className="mt-1.5 h-4 w-20" />
        <div className="mt-3 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-sm" />
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-18" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <Skeleton className="h-3 w-16" />
        <div className="mt-2 flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
      <Skeleton className="h-4 w-24" />
      <div className="mt-6 rounded-lg border border-border bg-card p-6 md:p-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-8 w-2/3" />
        <div className="mt-4 flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="mt-5 flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
        <div className="mt-8 space-y-4 border-t border-border pt-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function CompanyDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
      <Skeleton className="h-4 w-28" />
      <div className="mt-6 rounded-lg border border-border bg-card p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-1 h-7 w-40" />
          </div>
        </div>
        <div className="mt-5 flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="mt-6 space-y-3 border-t border-border pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
