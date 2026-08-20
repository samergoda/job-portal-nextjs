import httpClient, { API_ENDPOINTS } from "@/lib/api";

export const getSavedJobs = async () => {
  const response = await httpClient.get(API_ENDPOINTS.SAVED_JOBS);
  return response.data;
};

export const saveJob = async (jobId: string | number) => {
  const response = await httpClient.post(API_ENDPOINTS.SAVE_JOB(jobId));
  return response.data;
};

export const unsaveJob = async (jobId: string | number) => {
  const response = await httpClient.delete(API_ENDPOINTS.UNSAVE_JOB(jobId));
  return response.data;
};
