"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Banknote, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDetailSkeleton } from "@/components/ui/skeleton";
import { useJobById } from "@/lib/hooks/use-jobs";
import { use } from "react";

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { job, loading, error } = useJobById(id);

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Job not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The job you're looking for doesn't exist or has been removed.</p>
        <Link href="/jobs" className="mt-6 inline-block">
          <Button>Back to jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to jobs
      </Link>

      <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{job.company}</p>
            <h1 className="mt-1 text-2xl font-bold text-card-foreground sm:text-3xl">{job.title}</h1>
          </div>
          <span className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
            {job.type}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {job.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Banknote className="h-4 w-4" />
            {job.salary}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            Posted recently
          </span>
        </div>

        {job.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 space-y-6 border-t border-border pt-6">
          <div>
            <h2 className="text-base font-semibold text-card-foreground">Role overview</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{job.description}</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-card-foreground">Responsibilities</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Lead product initiatives and work closely with cross-functional teams.</li>
              <li>Ship polished user experiences that balance business goals and usability.</li>
              <li>Prototype, validate, and iterate based on customer feedback.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-card-foreground">Requirements</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Strong track record in delivering production-ready digital experiences.</li>
              <li>Comfortable collaborating with engineering, design, and stakeholders.</li>
              <li>Excellent communication and problem-solving skills.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex gap-3 border-t border-border pt-6">
          <Button>Apply now</Button>
          <Button variant="outline">Save job</Button>
        </div>
      </div>
    </div>
  );
}
