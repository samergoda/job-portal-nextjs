import Link from "next/link";
import { MapPin, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DisplayJob } from "@/lib/types";

export function JobCard({ job }: { job: DisplayJob }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
        <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
          {job.type}
        </span>
      </div>

      <h3 className="mt-2 text-lg font-semibold leading-snug text-card-foreground">
        {job.title}
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Banknote className="h-3.5 w-3.5" />
          {job.salary}
        </span>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">{job.description}</p>

      {job.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 border-t border-border pt-4">
        <Link href={`/jobs/${job.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            View details
          </Button>
        </Link>
      </div>
    </article>
  );
}
