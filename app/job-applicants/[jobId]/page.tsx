"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  getApplicationsByJob,
  updateApplicationStatus,
  type JobApplication,
} from "@/lib/services/job-application-service";
import { useJobById } from "@/lib/hooks/use-jobs";

const STATUS_OPTIONS = ["Applied", "In Review", "Interview", "Hired", "Rejected"] as const;

type Applicant = {
  applicationId: number | string;
  name: string;
  email: string;
  title: string;
  phone: string;
  location: string;
  bio: string;
  experience: string;
  portfolio: string | null;
  appliedAt?: string;
  status: string;
};

function statusColor(status: string): string {
  switch (status) {
    case "Applied": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "In Review": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Interview": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "Rejected": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "Hired": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    default: return "bg-muted text-muted-foreground";
  }
}

function getTimeAgo(dateString?: string): string {
  if (!dateString) return "recently";
  const diffInHours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
}

function toApplicant(app: JobApplication): Applicant {
  const p = app.userProfile;
  return {
    applicationId: app.id,
    name: app.userName,
    email: app.userEmail,
    title: p?.jobTitle || "Not specified",
    phone: app.userMobileNumber || "Not provided",
    location: p?.location || "Not specified",
    bio: p?.professionalBio || "No bio available",
    experience: p?.experienceLevel || "No experience provided",
    portfolio: p?.portfolioWebsite || null,
    appliedAt: app.appliedAt,
    status: app.status || "Applied",
  };
}

export default function JobApplicantsPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const { isEmployer, isAuthenticated, isLoading: authLoading } = useAuth();
  const { job } = useJobById(jobId);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [contactApplicant, setContactApplicant] = useState<Applicant | null>(null);
  const [profileApplicant, setProfileApplicant] = useState<Applicant | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const load = useCallback(async () => {
    if (!isEmployer) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getApplicationsByJob(jobId);
      setApplicants(data.map(toApplicant));
    } catch {
      showNotification("Failed to load applications", "error");
    } finally {
      setLoading(false);
    }
  }, [jobId, isEmployer]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  const handleStatusChange = async (applicationId: number | string, newStatus: string) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      setApplicants((prev) =>
        prev.map((a) => (a.applicationId === applicationId ? { ...a, status: newStatus } : a))
      );
      showNotification("Application status updated successfully!");
    } catch {
      showNotification("Failed to update application status", "error");
    }
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: applicants.length,
      applied: 0, inreview: 0, interview: 0, hired: 0, rejected: 0,
    };
    for (const a of applicants) {
      const key = a.status.toLowerCase().replace(" ", "");
      if (key in counts) counts[key] += 1;
    }
    return counts;
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    const list = filter === "all"
      ? applicants
      : applicants.filter((a) => a.status.toLowerCase().replace(" ", "") === filter);
    return [...list].sort(
      (a, b) => new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime()
    );
  }, [applicants, filter]);

  // Guards
  if (authLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-6 py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !isEmployer) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {!isAuthenticated ? "Please Log In" : "Access Denied"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {!isAuthenticated
            ? "You need to be logged in to view job applicants."
            : "This page is only available for employers."}
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  const FILTER_TABS = [
    { key: "all", label: "All Applications" },
    { key: "applied", label: "Applied" },
    { key: "inreview", label: "In Review" },
    { key: "interview", label: "Interview" },
    { key: "hired", label: "Hired" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
      {/* Header */}
      <Link href="/employer/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to My Jobs
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground">Job Applicants</h1>
      {job && (
        <p className="mt-1 text-sm text-muted-foreground">
          {job.title} at {job.company} • {job.location} • Posted {getTimeAgo(job.postedDate ?? undefined)}
        </p>
      )}

      {/* Notification */}
      {notification && (
        <p className={`mt-4 rounded-md border px-3 py-2 text-sm ${
          notification.type === "success"
            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
            : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
        }`}>
          {notification.message}
        </p>
      )}

      {/* Filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {label} ({statusCounts[key] ?? 0})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="mt-10 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : applicants.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">No Applications Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Applications will appear here once candidates start applying.
          </p>
        </div>
      ) : filteredApplicants.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-foreground">No Applications Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">No applications match the selected filter.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filteredApplicants.map((a) => (
            <div key={a.applicationId} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{a.name}</h3>
                    <p className="text-sm text-muted-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Applied {getTimeAgo(a.appliedAt)}</p>
                    <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(a.status)}`}>
                      {a.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:w-56">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground">Update Status</label>
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.applicationId, e.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <Button size="sm" onClick={() => setContactApplicant(a)}>Contact Applicant</Button>
                  <Button size="sm" variant="outline" onClick={() => setProfileApplicant(a)}>View Profile</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact modal */}
      {contactApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setContactApplicant(null)}>
          <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {contactApplicant.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="mt-3 text-xl font-bold text-foreground">{contactApplicant.name}</h3>
              <p className="text-sm text-muted-foreground">{contactApplicant.title}</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground">{contactApplicant.email}</p>
                </div>
                <a href={`mailto:${contactApplicant.email}`}>
                  <Button size="sm"><Mail className="h-4 w-4" /> Email</Button>
                </a>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Phone</p>
                  <p className="text-sm text-foreground">{contactApplicant.phone}</p>
                </div>
                <a href={`tel:${contactApplicant.phone}`}>
                  <Button size="sm" variant="outline"><Phone className="h-4 w-4" /> Call</Button>
                </a>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={() => setContactApplicant(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Profile modal */}
      {profileApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setProfileApplicant(null)}>
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setProfileApplicant(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                {profileApplicant.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="mt-3 text-2xl font-bold text-foreground">{profileApplicant.name}</h3>
              <p className="text-primary">{profileApplicant.title}</p>
              <p className="text-sm text-muted-foreground">{profileApplicant.location}</p>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-foreground">About</h4>
                <p className="mt-1 text-sm text-muted-foreground">{profileApplicant.bio}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Experience</h4>
                <p className="mt-1 text-sm text-muted-foreground">{profileApplicant.experience}</p>
              </div>
              {profileApplicant.portfolio && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Portfolio</h4>
                  <a href={profileApplicant.portfolio} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-primary hover:underline">
                    {profileApplicant.portfolio}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
