"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios, { AxiosError } from "axios";
import { useAuth } from "@/lib/auth-context";
import * as savedJobService from "@/lib/services/saved-job-service";
import * as jobApplicationService from "@/lib/services/job-application-service";

type JobItem = {
  id: string | number;
  title?: string;
  company?: string;
  companyId?: string | number;
  savedAt?: string;
  appliedAt?: string;
  status?: string;
  applicationId?: string | number;
  coverLetter?: string;
  [key: string]: unknown;
};

type ApplicationRecord = {
  id: string | number;
  job: Record<string, unknown>;
  appliedAt: string;
  status: string;
  coverLetter?: string;
};

type SavedJobRecord = {
  job: Record<string, unknown>;
  savedAt: string;
};

type ApiErrorData = {
  message?: string;
};

type JobContextValue = {
  appliedJobs: JobItem[];
  savedJobs: JobItem[];
  postedJobs: JobItem[];
  allApplications: JobItem[];
  totalAppliedJobs: number;
  totalSavedJobs: number;
  totalPostedJobs: number;
  applyForJob: (job: JobItem, coverLetter?: string) => Promise<{ success: boolean; message?: string; error?: string; requiresProfile?: boolean }>;
  saveJob: (job: JobItem) => Promise<{ success: boolean; message?: string; error?: string }>;
  unsaveJob: (jobId: string | number) => Promise<{ success: boolean; message?: string; error?: string }>;
  isJobApplied: (jobId: string | number) => boolean;
};

const JobContext = createContext<JobContextValue | undefined>(undefined);

export function JobProvider({ children }: { children: React.ReactNode }) {
  const [appliedJobs, setAppliedJobs] = useState<JobItem[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobItem[]>([]);
  const [postedJobs, setPostedJobs] = useState<JobItem[]>([]);
  const [allApplications, setAllApplications] = useState<JobItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setAppliedJobs([]);
        setSavedJobs([]);
        setPostedJobs([]);
        setAllApplications([]);
        return;
      }

      if (user.role === "ROLE_JOB_SEEKER" || user.role === "jobSeeker") {
        try {
          const applications: ApplicationRecord[] = await jobApplicationService.getMyApplications();
          const transformed: JobItem[] = applications.map((app) => ({
            ...app.job,
            id: app.id,
            appliedAt: app.appliedAt,
            status: app.status,
            applicationId: app.id,
            coverLetter: app.coverLetter,
          }));
          setAppliedJobs(transformed);
        } catch {
          // Silently fail — user will see empty state
        }

        try {
          const saved: SavedJobRecord[] = await savedJobService.getSavedJobs();
          const mapped: JobItem[] = saved.map((item) => ({
            ...item.job,
            id: item.job.id as string | number,
            savedAt: item.savedAt,
          }));
          setSavedJobs(mapped);
        } catch {
          // Silently fail — user will see empty state
        }
      }
    };

    loadData();
  }, [user]);

  const applyForJob = async (job: JobItem, coverLetter = "") => {
    if (!user || !(user.role === "ROLE_JOB_SEEKER" || user.role === "jobSeeker")) {
      return { success: false, error: "Only job seekers can apply for jobs" };
    }

    if (!user.profileComplete) {
      return { success: false, error: "Please complete your profile before applying for jobs", requiresProfile: true };
    }

    if (appliedJobs.some((item) => item.id === job.id)) {
      return { success: false, error: "You have already applied for this job" };
    }

    try {
      const application = await jobApplicationService.applyForJob(job.id, coverLetter);
      const nextApplication: JobItem = {
        ...job,
        appliedAt: application.appliedAt,
        status: application.status,
        applicationId: application.id,
        coverLetter: application.coverLetter,
      };
      setAppliedJobs((previous) => [...previous, nextApplication]);
      return { success: true, message: "Application submitted successfully!" };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        return { success: false, error: axiosError.response?.data?.message || "Failed to apply for job" };
      }
      return { success: false, error: "Failed to apply for job" };
    }
  };

  const saveJob = async (job: JobItem) => {
    if (!user || !(user.role === "ROLE_JOB_SEEKER" || user.role === "jobSeeker")) {
      return { success: false, error: "Only job seekers can save jobs" };
    }

    if (savedJobs.some((item) => item.id === job.id)) {
      return { success: false, error: "Job is already saved" };
    }

    try {
      await savedJobService.saveJob(job.id);
      setSavedJobs((previous) => [{ ...job, savedAt: new Date().toISOString() }, ...previous]);
      return { success: true, message: "Job saved successfully!" };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        return { success: false, error: axiosError.response?.data?.message || "Failed to save job" };
      }
      return { success: false, error: "Failed to save job" };
    }
  };

  const unsaveJob = async (jobId: string | number) => {
    if (!user || !(user.role === "ROLE_JOB_SEEKER" || user.role === "jobSeeker")) {
      return { success: false, error: "Only job seekers can unsave jobs" };
    }

    try {
      await savedJobService.unsaveJob(jobId);
      setSavedJobs((previous) => previous.filter((item) => item.id !== jobId));
      return { success: true, message: "Job removed from saved jobs" };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData>;
        return { success: false, error: axiosError.response?.data?.message || "Failed to unsave job" };
      }
      return { success: false, error: "Failed to unsave job" };
    }
  };

  const isJobApplied = (jobId: string | number) => appliedJobs.some((item) => item.id === jobId);

  const value = useMemo<JobContextValue>(
    () => ({
      appliedJobs,
      savedJobs,
      postedJobs,
      allApplications,
      totalAppliedJobs: appliedJobs.length,
      totalSavedJobs: savedJobs.length,
      totalPostedJobs: postedJobs.length,
      applyForJob,
      saveJob,
      unsaveJob,
      isJobApplied,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appliedJobs, savedJobs, postedJobs, allApplications, user]
  );

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
}

export function useJobs() {
  const context = useContext(JobContext);

  if (!context) {
    throw new Error("useJobs must be used within a JobProvider");
  }

  return context;
}
