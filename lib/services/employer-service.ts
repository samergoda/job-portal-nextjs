import httpClient, { API_ENDPOINTS } from "@/lib/api";

export type EmployerJob = {
  id: number | string;
  title: string;
  category?: string;
  location?: string;
  workType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  applicationsCount?: number;
  postedDate?: string;
  status?: "ACTIVE" | "CLOSED" | "DRAFT" | string;
  companyId?: number | string;
  companyName?: string;
  companyLogo?: string;
};

export type JobStatus = "ACTIVE" | "CLOSED" | "DRAFT";

/**
 * Fetch all jobs posted by the current employer.
 */
export const getEmployerJobs = async (): Promise<EmployerJob[]> => {
  const response = await httpClient.get<EmployerJob[]>(API_ENDPOINTS.EMPLOYER_JOBS);
  return response.data || [];
};

/**
 * Update the status of an employer's job (ACTIVE / CLOSED / DRAFT).
 */
export const updateJobStatus = async (
  jobId: number | string,
  status: JobStatus
): Promise<EmployerJob> => {
  const response = await httpClient.patch<EmployerJob>(
    API_ENDPOINTS.UPDATE_JOB_STATUS(jobId),
    { status }
  );
  return response.data;
};

export type NewJobPayload = {
  title: string;
  description: string;
  location: string;
  jobType: string;
  workType: string;
  category: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: string;
  requirements: string | null;
  benefits: string | null;
  applicationDeadline: string | null;
  remote: boolean;
  featured: boolean;
  urgent: boolean;
  status: string;
};

/**
 * Post a new job (employer only).
 */
export const postJob = async (job: NewJobPayload): Promise<EmployerJob> => {
  const response = await httpClient.post<EmployerJob>(API_ENDPOINTS.POST_JOB, job);
  return response.data;
};
