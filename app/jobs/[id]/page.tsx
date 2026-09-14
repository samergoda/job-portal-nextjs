"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Banknote, Clock, Briefcase, Wifi, Layers,
  GraduationCap, CheckCircle2, Heart, Building2, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobDetailSkeleton } from "@/components/ui/skeleton";
import { useJobById } from "@/lib/hooks/use-jobs";
import { useJobs as useJobActions } from "@/lib/job-context";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/hooks/use-toast";

function getTimeAgo(dateString: string | null): string {
  if (!dateString) return "Recently";
  const diffInHours = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60));
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { job, loading, error } = useJobById(id);
  const { isAuthenticated, isJobSeeker } = useAuth();
  const { applyForJob, saveJob, isJobApplied } = useJobActions();

  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Job not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The job you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/jobs" className="mt-6 inline-block">
          <Button>Back to jobs</Button>
        </Link>
      </div>
    );
  }

  const applied = isJobApplied(job.id);
  const longDescription = job.description.length > 320;

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isJobSeeker) {
      toast({ title: "Only job seekers can apply for jobs", variant: "destructive" });
      return;
    }
    setApplying(true);
    const result = await applyForJob({ id: job.id, title: job.title, company: job.company });
    setApplying(false);
    if (result.success) {
      toast({ title: result.message || "Application submitted!", variant: "success" });
    } else {
      toast({ title: result.error || "Failed to apply", variant: "destructive" });
      if (result.requiresProfile) setTimeout(() => router.push("/profile" as never), 1500);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!isJobSeeker) {
      toast({ title: "Only job seekers can save jobs", variant: "destructive" });
      return;
    }
    setSaving(true);
    const result = await saveJob({ id: job.id, title: job.title, company: job.company });
    setSaving(false);
    toast({
      title: result.success ? result.message || "Job saved!" : result.error || "Failed to save",
      variant: result.success ? "success" : "destructive",
    });
  };

  const overviewItems = [
    { icon: <Layers className="h-4 w-4" />, label: "Category", value: job.category || "—" },
    { icon: <GraduationCap className="h-4 w-4" />, label: "Experience Level", value: job.experienceLevel || "—" },
    { icon: <Wifi className="h-4 w-4" />, label: "Work Type", value: job.workType || "—" },
    { icon: <Briefcase className="h-4 w-4" />, label: "Job Type", value: job.type || "—" },
    { icon: <Banknote className="h-4 w-4" />, label: "Salary", value: job.salary },
    { icon: <Clock className="h-4 w-4" />, label: "Posted", value: getTimeAgo(job.postedDate) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to jobs
      </Link>

      {/* Hero header */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">{job.title}</h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{job.company}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />{job.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />{job.type}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />{getTimeAgo(job.postedDate)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {job.workType}
                </span>
                {job.category && (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-primary">
                    {job.category}
                  </span>
                )}
                {job.experienceLevel && (
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {job.experienceLevel}
                  </span>
                )}
                {job.remote && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Remote
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-card-foreground">{job.salary}</p>
            <p className="text-xs text-muted-foreground">Salary range</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
          <Button onClick={handleApply} disabled={applying || applied}>
            {applying ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Applying...</>
            ) : applied ? (
              <><CheckCircle2 className="h-4 w-4" /> Applied</>
            ) : (
              "Apply now"
            )}
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
            Save job
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-semibold text-card-foreground">Job Description</h2>
            <p className={`mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground ${!showFullDescription && longDescription ? "line-clamp-6" : ""}`}>
              {job.description || "No description provided."}
            </p>
            {longDescription && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                {showFullDescription ? "Show less" : "Read more"}
              </button>
            )}
          </section>

          {/* Skills / requirements from tags */}
          {job.tags.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
              <h2 className="text-lg font-semibold text-card-foreground">Skills &amp; Requirements</h2>
              <ul className="mt-3 space-y-2.5">
                {job.tags.map((tag) => (
                  <li key={tag} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {tag}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job overview */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold text-card-foreground">Job Overview</h3>
            <dl className="mt-4 space-y-4">
              {overviewItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    {item.icon}
                  </span>
                  <div>
                    <dt className="text-xs text-muted-foreground">{item.label}</dt>
                    <dd className="text-sm font-medium text-card-foreground">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Company */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold text-card-foreground">About the Company</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
                {job.company.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-card-foreground">{job.company}</p>
                <p className="text-xs text-muted-foreground">{job.location}</p>
              </div>
            </div>
            <Link href="/companies" className="mt-4 inline-flex w-full">
              <Button variant="outline" className="w-full">
                <Building2 className="h-4 w-4" />
                View Companies
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
