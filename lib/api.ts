import axios, { AxiosHeaders } from "axios";

/**
 * Client-side HTTP client.
 *
 * All authenticated requests go through /api/proxy/... route handlers,
 * which attach the JWT from the httpOnly cookie on the server side.
 * The token is NEVER accessible to client-side JavaScript.
 *
 * Public data endpoints also go through the proxy for consistency.
 */

export const DEFAULT_API_VERSION = "1.0";

export const getAcceptHeader = (version = DEFAULT_API_VERSION) =>
  `application/vnd.eazyapp+json;v=${version}`;

export const API_ENDPOINTS = {
  COMPANIES: "/companies/public",
  COMPANY_BY_ID: (id: string | number) => `/companies/${id}`,
  JOBS: "/jobs",
  JOB_BY_ID: (id: string | number) => `/jobs/${id}`,
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/profile",
  UPDATE_PROFILE: "/profile",
  CONTACTS: "/contacts",
  CONTACT_BY_ID: (id: string | number) => `/contacts/${id}`,
  ADMIN_CONTACTS: "/admin/contacts",
  ADMIN_CONTACTS_SORT: "/admin/contacts/sort",
  ADMIN_CONTACTS_PAGE: "/admin/contacts/page",
  UPDATE_CONTACT_STATUS: (id: string | number) => `/admin/contacts/${id}/status`,
  CSRF_TOKEN: "/csrf-token",
  SEARCH_USER_BY_EMAIL: "/admin/users/search",
  ELEVATE_TO_EMPLOYER: (userId: string | number) => `/admin/users/${userId}/elevate-to-employer`,
  ASSIGN_COMPANY_TO_EMPLOYER: (userId: string | number) => `/admin/users/${userId}/assign-company`,
  EMPLOYER_JOBS: "/employer/jobs",
  POST_JOB: "/employer/jobs",
  UPDATE_JOB_STATUS: (jobId: string | number) => `/employer/jobs/${jobId}/status`,
  SAVED_JOBS: "/saved-jobs",
  SAVED_JOB_IDS: "/saved-jobs/ids",
  SAVE_JOB: (jobId: string | number) => `/saved-jobs/${jobId}`,
  UNSAVE_JOB: (jobId: string | number) => `/saved-jobs/${jobId}`,
  CHECK_JOB_SAVED: (jobId: string | number) => `/saved-jobs/check/${jobId}`,
  JOB_APPLICATIONS: "/job-applications",
  APPLY_JOB: "/job-applications",
  WITHDRAW_APPLICATION: (jobId: string | number) => `/job-applications/${jobId}`,
  MY_APPLICATIONS: "/job-applications/my-applications",
  APPLIED_JOB_IDS: "/job-applications/applied-job-ids",
  CHECK_APPLIED: (jobId: string | number) => `/job-applications/check/${jobId}`,
  APPLICATIONS_BY_JOB: (jobId: string | number) => `/job-applications/job/${jobId}`,
  COMPANY_APPLICATIONS: "/job-applications/company-applications",
  UPDATE_APPLICATION_STATUS: (applicationId: string | number) => `/job-applications/${applicationId}/status`,
};

/**
 * The httpClient now targets Next.js proxy routes (/api/proxy/...).
 * The proxy attaches the JWT from the httpOnly cookie server-side.
 * No token handling on the client.
 */
const httpClient = axios.create({
  baseURL: "/api/proxy",
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use((config) => {
  const headers = new AxiosHeaders(config.headers || {});
  headers.set("Accept", getAcceptHeader());
  config.headers = headers;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const isLoginRequest = String(error.config?.url || "").includes("/auth/login");
        const isOnLoginPage = window.location.pathname === "/login";

        if (!isLoginRequest && !isOnLoginPage) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const withApiVersion = (version: string) => ({
  get: (url: string, config = {}) => {
    const headers = new AxiosHeaders((config as any)?.headers || {});
    headers.set("Accept", getAcceptHeader(version));
    return httpClient.get(url, { ...(config as any), headers });
  },
  post: (url: string, data?: unknown, config = {}) => {
    const headers = new AxiosHeaders((config as any)?.headers || {});
    headers.set("Accept", getAcceptHeader(version));
    return httpClient.post(url, data, { ...(config as any), headers });
  },
  put: (url: string, data?: unknown, config = {}) => {
    const headers = new AxiosHeaders((config as any)?.headers || {});
    headers.set("Accept", getAcceptHeader(version));
    return httpClient.put(url, data, { ...(config as any), headers });
  },
  patch: (url: string, data?: unknown, config = {}) => {
    const headers = new AxiosHeaders((config as any)?.headers || {});
    headers.set("Accept", getAcceptHeader(version));
    return httpClient.patch(url, data, { ...(config as any), headers });
  },
  delete: (url: string, config = {}) => {
    const headers = new AxiosHeaders((config as any)?.headers || {});
    headers.set("Accept", getAcceptHeader(version));
    return httpClient.delete(url, { ...(config as any), headers });
  },
});

export default httpClient;
