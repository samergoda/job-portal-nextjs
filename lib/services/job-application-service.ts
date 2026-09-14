import httpClient, { API_ENDPOINTS } from "@/lib/api";

export const applyForJob = async (jobId: string | number, coverLetter = "") => {
  const response = await httpClient.post(API_ENDPOINTS.APPLY_JOB, { jobId, coverLetter });
  return response.data;
};

export const getMyApplications = async () => {
  const response = await httpClient.get(API_ENDPOINTS.MY_APPLICATIONS);
  return response.data;
};

export const withdrawApplication = async (jobId: string | number) => {
  const response = await httpClient.delete(API_ENDPOINTS.WITHDRAW_APPLICATION(jobId));
  return response.data;
};

export type ApplicantProfile = {
  jobTitle?: string;
  location?: string;
  professionalBio?: string;
  experienceLevel?: string;
  portfolioWebsite?: string;
};

export type JobApplication = {
  id: number | string;
  userName: string;
  userEmail: string;
  userMobileNumber?: string;
  appliedAt?: string;
  status?: string;
  userProfile?: ApplicantProfile;
};

/** Fetch all applications for a given job (employer only). */
export const getApplicationsByJob = async (jobId: string | number): Promise<JobApplication[]> => {
  const response = await httpClient.get<JobApplication[]>(API_ENDPOINTS.APPLICATIONS_BY_JOB(jobId));
  return response.data || [];
};

/** Update the status of a job application (employer only). */
export const updateApplicationStatus = async (
  applicationId: string | number,
  status: string
): Promise<JobApplication> => {
  const response = await httpClient.patch<JobApplication>(
    API_ENDPOINTS.UPDATE_APPLICATION_STATUS(applicationId),
    { status }
  );
  return response.data;
};
