import httpClient, { API_ENDPOINTS } from "@/lib/api";

export const getProfile = async () => {
  const response = await httpClient.get(API_ENDPOINTS.PROFILE);
  return response.data;
};

export const updateProfile = async (formData: FormData) => {
  const response = await httpClient.post(API_ENDPOINTS.UPDATE_PROFILE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
