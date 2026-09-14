"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Loader2, Users, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  getEmployerJobs,
  updateJobStatus,
  type EmployerJob,
  type JobStatus,
} from "@/lib/services/employer-service";

const STATUSES: JobStatus[] = ["ACTIVE", "CLOSED", "DRAFT"];

function statusBadgeClasses(status?: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "CLOSED":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "DRAFT":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatSalary(min?: number, max?: number, currency = "USD"): string {
  if (min == null || max == null) return "—";
  return `${currency} ${(min / 1000).toFixed(0)}k - ${(max / 1000).toFixed(0)}k`;
}

function getTimeAgo(dateString?: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const diffInHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
}

export default function EmployerJobsPage() {
  const { isEmployer, isLoading: authLoading } = useAuth();

  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingJobId, setUpdatingJobId] = useState<number | string | null>(null);
  const [pending, setPending] = useState<{ jobId: number | string; status: JobStatus } | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEmployerJobs();
      setJobs(data);
    } catch {
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isEmployer) {
      fetchJobs();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isEmployer, fetchJobs]);

  const confirmStatusChange = async () => {
    if (!pending) return;
    const { jobId, status } = pending;

    try {
      setUpdatingJobId(jobId);
      setError("");
      setSuccess("");
      setPending(null);

      const updated = await updateJobStatus(jobId, status);
      setJobs((prev) => prev.map((job) => (job.id === jobId ? updated : job)));
      setSuccess(`Job status updated to ${status}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update job status");
    } finally {
      setUpdatingJobId(null);
    }
  };

  const companyInfo = jobs.length > 0
    ? { name: jobs[0].companyName, logo: jobs[0].companyLogo }
    : null;

  // Auth guards
  if (authLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-6 py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isEmployer) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You must be logged in as an employer to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Posted Jobs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your job postings and update their status
        </p>
      </div>

      {/* Company info */}
      {companyInfo && (
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
            {companyInfo.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={companyInfo.logo} alt={companyInfo.name || "Company"} className="h-full w-full rounded-xl object-cover" />
            ) : (
              companyInfo.name?.charAt(0) || "C"
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{companyInfo.name}</h2>
            <p className="text-sm text-muted-foreground">
              Company Jobs Dashboard • {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"} Posted
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      {success && (
        <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="mt-10 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        /* Empty state */
        <div className="mt-8 rounded-lg border border-border bg-card p-12 text-center shadow-sm">
          <Briefcase className="mx-auto h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No jobs posted yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Start by posting your first job to attract talented candidates.
          </p>
          <Link href="/employer/post-job" className="mt-6 inline-block">
            <Button>Post a Job</Button>
          </Link>
        </div>
      ) : (
        /* Jobs table */
        <div className="mt-8 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Salary</th>
                  <th className="px-4 py-3">Applicants</th>
                  <th className="px-4 py-3">Posted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr key={job.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.category}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">{job.location || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {job.workType && (
                          <span className="w-fit rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            {job.workType}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span className="w-fit rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {job.experienceLevel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                      </p>
                      {job.salaryPeriod && (
                        <p className="text-xs text-muted-foreground">per {job.salaryPeriod}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        {job.applicationsCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {getTimeAgo(job.postedDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClasses(job.status)}`}>
                          {job.status}
                        </span>
                        <div className="flex gap-1">
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => setPending({ jobId: job.id, status: s })}
                              disabled={updatingJobId === job.id || job.status === s}
                              title={`Set to ${s}`}
                              className="rounded px-1.5 py-0.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {s.charAt(0)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/job-applicants/${job.id}` as Route}>
                          <Button size="sm">Applicants</Button>
                        </Link>
                        <Link href={`/jobs/${job.id}` as Route}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-center text-lg font-bold text-foreground">Confirm Status Change</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Change this job status to{" "}
              <span className="font-bold text-foreground">{pending.status}</span>?
            </p>
            {pending.status === "CLOSED" && (
              <p className="mt-2 text-center text-xs italic text-muted-foreground">
                Closing this job will stop accepting new applications.
              </p>
            )}
            {pending.status === "DRAFT" && (
              <p className="mt-2 text-center text-xs italic text-muted-foreground">
                Setting to draft will hide this job from job seekers.
              </p>
            )}
            {pending.status === "ACTIVE" && (
              <p className="mt-2 text-center text-xs italic text-muted-foreground">
                Activating this job will make it visible to job seekers.
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={confirmStatusChange}>
                Yes, Change Status
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
