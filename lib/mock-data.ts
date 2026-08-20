// Re-export types for backward compatibility
export type { DisplayJob as Job, DisplayCompany as Company } from "@/lib/types";

// This file previously contained static mock data.
// The application now fetches data from the real API.
// See lib/services/data-service.ts and lib/hooks/ for data fetching.
