"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/lib/auth-context";
import { postJob } from "@/lib/services/employer-service";
import axios from "axios";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const WORK_TYPES = ["Remote", "Hybrid", "On-site"];
const CATEGORIES = ["Technology", "Marketing", "Sales", "Design", "Finance", "Operations", "Other"];
const EXPERIENCE_LEVELS = ["Entry-level", "Mid-level", "Senior-level", "Executive"];
const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "INR"];
const SALARY_PERIODS = ["year", "month", "hour"];

type FormData = {
  title: string;
  description: string;
  location: string;
  jobType: string;
  workType: string;
  category: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryPeriod: string;
  applicationDeadline: string;
  requirements: string[];
  benefits: string[];
  remote: boolean;
  featured: boolean;
  urgent: boolean;
};

type FormErrors = Partial<Record<string, string>>;

const selectClass =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary";

export default function PostJobPage() {
  const router = useRouter();
  const { user, isEmployer, isAuthenticated, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    location: "",
    jobType: "Full-time",
    workType: "On-site",
    category: "Technology",
    experienceLevel: "Mid-level",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    salaryPeriod: "year",
    applicationDeadline: "",
    requirements: [""],
    benefits: [""],
    remote: false,
    featured: false,
    urgent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleArrayChange = (index: number, value: string, field: "requirements" | "benefits") => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: "requirements" | "benefits") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (index: number, field: "requirements" | "benefits") => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.description.trim()) newErrors.description = "Job description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    const min = parseInt(formData.salaryMin, 10);
    const max = parseInt(formData.salaryMax, 10);
    if (!formData.salaryMin || min < 1000) newErrors.salaryMin = "Minimum salary must be at least 1,000";
    if (!formData.salaryMax || max < 1000) newErrors.salaryMax = "Maximum salary must be at least 1,000";
    if (min && max && max <= min) newErrors.salaryMax = "Maximum salary must be higher than minimum salary";

    if (formData.requirements.filter((r) => r.trim()).length === 0)
      newErrors.requirements = "At least one requirement is needed";
    if (formData.benefits.filter((b) => b.trim()).length === 0)
      newErrors.benefits = "At least one benefit is needed";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const requirementsList = formData.requirements.filter((r) => r.trim());
      const benefitsList = formData.benefits.filter((b) => b.trim());

      await postJob({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        jobType: formData.jobType,
        workType: formData.workType,
        category: formData.category,
        experienceLevel: formData.experienceLevel,
        salaryMin: parseFloat(formData.salaryMin),
        salaryMax: parseFloat(formData.salaryMax),
        salaryCurrency: formData.salaryCurrency,
        salaryPeriod: formData.salaryPeriod,
        requirements: requirementsList.length > 0 ? JSON.stringify(requirementsList) : null,
        benefits: benefitsList.length > 0 ? JSON.stringify(benefitsList) : null,
        applicationDeadline: formData.applicationDeadline
          ? new Date(formData.applicationDeadline).toISOString()
          : null,
        remote: formData.workType === "Remote" || formData.remote,
        featured: formData.featured,
        urgent: formData.urgent,
        status: "ACTIVE",
      });

      router.push("/employer/jobs");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message || "Failed to post job. Please try again."
        : "Failed to post job. Please try again.";
      setErrors({ general: message });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {!isAuthenticated ? "You need to be logged in to post jobs." : "This page is only available for employers."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Post a New Job</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find the perfect candidate for {(user?.company as string) || "your company"}
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Job Title" error={errors.title}>
              <Input name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Senior Software Engineer" />
            </FormField>
            <FormField label="Location" error={errors.location}>
              <Input name="location" value={formData.location} onChange={handleChange} placeholder="e.g., San Francisco, CA" />
            </FormField>
          </div>

          <FormField label="Job Description" error={errors.description}>
            <Textarea
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
            />
          </FormField>

          {/* Job details */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <FormField label="Job Type">
              <select name="jobType" value={formData.jobType} onChange={handleChange} className={selectClass}>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Work Type">
              <select name="workType" value={formData.workType} onChange={handleChange} className={selectClass}>
                {WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Category">
              <select name="category" value={formData.category} onChange={handleChange} className={selectClass}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Experience Level">
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className={selectClass}>
                {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </FormField>
          </div>

          {/* Salary */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <FormField label="Minimum Salary" error={errors.salaryMin}>
              <Input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange} placeholder="50000" />
            </FormField>
            <FormField label="Maximum Salary" error={errors.salaryMax}>
              <Input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange} placeholder="80000" />
            </FormField>
            <FormField label="Currency">
              <select name="salaryCurrency" value={formData.salaryCurrency} onChange={handleChange} className={selectClass}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Period">
              <select name="salaryPeriod" value={formData.salaryPeriod} onChange={handleChange} className={selectClass}>
                {SALARY_PERIODS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </FormField>
          </div>

          {/* Deadline */}
          <FormField label="Application Deadline (Optional)">
            <Input
              type="date"
              name="applicationDeadline"
              value={formData.applicationDeadline}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
            />
          </FormField>

          {/* Options */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Additional Options</label>
            <div className="flex flex-wrap gap-6">
              {(["featured", "urgent", "remote"] as const).map((opt) => (
                <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    name={opt}
                    checked={formData[opt]}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/40"
                  />
                  {opt === "featured" ? "Featured Job" : opt === "urgent" ? "Urgent Hiring" : "Remote Friendly"}
                </label>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Requirements</label>
            {formData.requirements.map((req, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <Input
                  value={req}
                  onChange={(e) => handleArrayChange(i, e.target.value, "requirements")}
                  placeholder="e.g., 3+ years of React experience"
                />
                {formData.requirements.length > 1 && (
                  <button type="button" onClick={() => removeArrayItem(i, "requirements")} className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("requirements")} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <Plus className="h-3.5 w-3.5" /> Add Requirement
            </button>
            {errors.requirements && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.requirements}</p>}
          </div>

          {/* Benefits */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Benefits &amp; Perks</label>
            {formData.benefits.map((benefit, i) => (
              <div key={i} className="mb-2 flex items-center gap-2">
                <Input
                  value={benefit}
                  onChange={(e) => handleArrayChange(i, e.target.value, "benefits")}
                  placeholder="e.g., Health insurance, Flexible hours"
                />
                {formData.benefits.length > 1 && (
                  <button type="button" onClick={() => removeArrayItem(i, "benefits")} className="rounded-md p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20" aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addArrayItem("benefits")} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <Plus className="h-3.5 w-3.5" /> Add Benefit
            </button>
            {errors.benefits && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.benefits}</p>}
          </div>

          {/* General error */}
          {errors.general && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
              {errors.general}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Posting Job...
                </>
              ) : (
                "Post Job"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
