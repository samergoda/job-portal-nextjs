import httpClient, { API_ENDPOINTS } from "@/lib/api";

export type ManagedUser = {
  userId: number | string;
  name: string;
  email: string;
  mobileNumber?: string;
  role: string;
  companyId?: number | string | null;
  companyName?: string | null;
  createdAt?: string;
};

/** Named entity the backend may return for role/company fields. */
type NamedEntity = { id?: number | string; name?: string };

function toName(value: string | NamedEntity | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name ?? "";
}

function normalizeUser(raw: Record<string, unknown>): ManagedUser {
  // Unwrap common response envelopes ({ data: {...} } or { user: {...} })
  const source =
    (raw.data as Record<string, unknown> | undefined) ??
    (raw.user as Record<string, unknown> | undefined) ??
    raw;

  const idValue =
    source.id ??
    source.userId ??
    source.user_id ??
    "";

  return {
    userId: idValue as number | string,
    name: (source.name as string) ?? "",
    email: (source.email as string) ?? "",
    mobileNumber: source.mobileNumber as string | undefined,
    role: toName(source.role as string | NamedEntity | null | undefined),
    companyId: (source.companyId as number | string | null | undefined) ?? null,
    companyName: toName(source.companyName as string | NamedEntity | null | undefined) || null,
    createdAt: source.createdAt as string | undefined,
  };
}

/**
 * Search a user by email address (admin only).
 */
export const searchUserByEmail = async (email: string): Promise<ManagedUser | null> => {
  const response = await httpClient.get<Record<string, unknown> | null>(
    API_ENDPOINTS.SEARCH_USER_BY_EMAIL,
    { params: { email } }
  );
  console.log("[searchUserByEmail] raw response:", JSON.stringify(response.data));
  if (!response.data) return null;

  const user = normalizeUser(response.data);
  // Backend may return an empty body when no user matches
  if (!user.userId) return null;
  return user;
};

/**
 * Elevate a job seeker to the employer role (admin only).
 */
export const elevateToEmployer = async (userId: number | string): Promise<ManagedUser> => {
  const response = await httpClient.patch<Record<string, unknown>>(API_ENDPOINTS.ELEVATE_TO_EMPLOYER(userId));
  return normalizeUser(response.data);
};

/**
 * Assign (or reassign) a company to an employer (admin only).
 */
export const assignCompanyToEmployer = async (
  userId: number | string,
  companyId: number
): Promise<ManagedUser> => {
  const response = await httpClient.patch<Record<string, unknown>>(
    API_ENDPOINTS.ASSIGN_COMPANY_TO_EMPLOYER(userId, companyId)
  );
  return normalizeUser(response.data);
};
