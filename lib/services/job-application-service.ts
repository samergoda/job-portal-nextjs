import httpClient, { API_ENDPOINTS } from "@/lib/api";

export const applyForJob = async (jobId: string | number, coverLetter = "") => {
  const response = await httpClient.post(API_ENDPOINTS.APPLY_JOB, { jobId, coverLetter });
  return response.data;
};

export const getMyApplications = async () => {
  const response = await httpClient.get(API_ENDPOINTS.MY_APPLICATIONS);
  return response.data;
};

export const getAppliedJobIds = async () => {
  const response = await httpClient.get(API_ENDPOINTS.APPLIED_JOB_IDS);
  return response.data;
};

export const checkApplied = async (jobId: string | number) => {
  const response = await httpClient.get(API_ENDPOINTS.CHECK_APPLIED(jobId));
  return response.data;
};
