"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Building2, TrendingUp, Wifi, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/sections/section-heading";
import { JobCard } from "@/components/sections/job-card";
import { CompanyCard } from "@/components/sections/company-card";
import { useCompaniesData } from "@/lib/companies-data-context";

export default function HomePage() {
  // Single source — jobs and companies both come from one fetch
  const { jobs, companies, loading } = useCompaniesData();
  const jobsLoading = loading;
  const companiesLoading = loading;

  const featuredJobs = jobs.slice(0, 6);
  const featuredCompanies = companies.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-muted/50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-sm font-medium text-primary">Find your next move</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Build the career you want.
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              Discover high-quality roles, connect with employers, and grow your career in a platform designed for modern hiring.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/jobs">
                <Button size="lg">
                  Explore jobs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/companies">
                <Button size="lg" variant="outline">
                  Top companies
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <Briefcase className="h-5 w-5 text-primary" />
              <p className="mt-3 text-2xl font-bold text-card-foreground">{jobs.length > 0 ? `${jobs.length}+` : "—"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Open roles</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <Building2 className="h-5 w-5 text-primary" />
              <p className="mt-3 text-2xl font-bold text-card-foreground">{companies.length > 0 ? companies.length : "—"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Companies</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <TrendingUp className="h-5 w-5 text-primary" />
              <p className="mt-3 text-2xl font-bold text-card-foreground">94%</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Success rate</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <Wifi className="h-5 w-5 text-primary" />
              <p className="mt-3 text-2xl font-bold text-card-foreground">48%</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Remote jobs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Featured roles"
            title="Popular job opportunities"
            description="Hand-picked listings from growing teams and companies seeking top talent."
          />
          <Link href="/jobs" className="hidden shrink-0 md:block">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {jobsLoading ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading jobs...</span>
          </div>
        ) : featuredJobs.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-border bg-card p-6 text-center">
            <p className="text-sm text-muted-foreground">No jobs available at the moment.</p>
          </div>
        )}
      </section>

      {/* Companies */}
      <section className="border-t border-border bg-muted/50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Employers"
              title="Organizations people love to work with"
              description="Explore the companies and teams creating the most opportunities for career growth."
            />
            <Link href="/companies" className="hidden shrink-0 md:block">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {companiesLoading ? (
            <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading companies...</span>
            </div>
          ) : featuredCompanies.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No companies available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
