import httpClient, { API_ENDPOINTS } from "@/lib/api";

export type ProfileData = {
  id?: number | string;
  jobTitle?: string;
  location?: string;
  experienceLevel?: string;
  professionalBio?: string;
  portfolioWebsite?: string | null;
  profilePictureName?: string | null;
  profilePictureType?: string | null;
  /** Jackson serializes byte[] as a base64 string. */
  profilePicture?: string | null;
  resumeName?: string | null;
  resumeType?: string | null;
  /** Jackson serializes byte[] as a base64 string. */
  resume?: string | null;
};

/**
 * Converts a base64 string (or data URL) from the backend into a usable
 * data URL for <img src> or window.open. Returns null if empty.
 */
export function toDataUrl(base64: string | null | undefined, mimeType: string | null | undefined, fallbackMime: string): string | null {
  if (!base64) return null;
  if (base64.startsWith("data:")) return base64;
  return `data:${mimeType || fallbackMime};base64,${base64}`;
}

export type ProfilePayload = {
  jobTitle: string;
  location: string;
  experienceLevel: string;
  professionalBio: string;
  portfolioWebsite: string | null;
};

/** Get the current user's profile. */
export const getProfile = async (): Promise<ProfileData | null> => {
  const response = await httpClient.get<ProfileData>(API_ENDPOINTS.PROFILE);
  return response.data;
};

/** Create or update the user's profile (multipart: profile JSON + optional files). */
export const updateProfile = async (
  profileData: ProfilePayload,
  profilePicture: File | null,
  resume: File | null
): Promise<ProfileData> => {
  const formData = new FormData();
  formData.append("profile", JSON.stringify(profileData));
  if (profilePicture) formData.append("profilePicture", profilePicture);
  if (resume) formData.append("resume", resume);

  const response = await httpClient.put<ProfileData>(API_ENDPOINTS.UPDATE_PROFILE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/** Get a blob URL for the profile picture (for use in img src). */
export const getProfilePictureUrl = async (): Promise<string | null> => {
  try {
    const response = await httpClient.get(API_ENDPOINTS.PROFILE_PICTURE, {
      responseType: "blob",
      headers: { Accept: "image/*" },
    });
    return URL.createObjectURL(response.data as Blob);
  } catch {
    return null;
  }
};

/** Get a blob URL for the resume (for preview/open in new tab). */
export const getResumeUrl = async (): Promise<string | null> => {
  try {
    const response = await httpClient.get(API_ENDPOINTS.PROFILE_RESUME, {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    });
    return URL.createObjectURL(response.data as Blob);
  } catch {
    return null;
  }
};
