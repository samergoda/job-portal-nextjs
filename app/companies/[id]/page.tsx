"use client";

import Link from "next/link";
import { ArrowLeft, MapPin, Users, Star, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/sections/job-card";
import { CompanyDetailSkeleton } from "@/components/ui/skeleton";
import { useCompanyById } from "@/lib/hooks/use-companies";
import { use } from "react";

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { company, loading, error } = useCompanyById(id);

  if (loading) {
    return <CompanyDetailSkeleton />;
  }

  if (error || !company) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Company not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The company you're looking for doesn't exist or has been removed.</p>
        <Link href="/companies" className="mt-6 inline-block">
          <Button>Back to companies</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to companies
      </Link>

      <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {company.logo && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted p-2">
                <img src={company.logo} alt={`${company.name} logo`} className="h-full w-full object-contain" />
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground">{company.industry}</p>
              <h1 className="text-2xl font-bold text-card-foreground">{company.name}</h1>
            </div>
          </div>
          {company.rating > 0 && (
            <div className="inline-flex shrink-0 items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
              <Star className="h-3 w-3 fill-current" />
              {company.rating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {company.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {company.employees > 0 ? company.employees.toLocaleString() + " employees" : company.size}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Globe className="h-4 w-4" />
            Hiring now
          </span>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm leading-relaxed text-muted-foreground">{company.description}</p>
        </div>

        <div className="mt-6 flex gap-3 border-t border-border pt-6">
          <Button>View open roles</Button>
          <Button variant="outline">Follow company</Button>
        </div>
      </div>

      {company.jobs && company.jobs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">Open positions ({company.jobs.length})</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {company.jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
