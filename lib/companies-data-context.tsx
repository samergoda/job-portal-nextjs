"use client";

import { createContext, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DisplayCompany, DisplayJob } from "@/lib/types";
import { fetchRawCompanies, mapDisplayJobs, mapDisplayCompanies } from "@/lib/services/data-service";

type CompaniesDataValue = {
  companies: DisplayCompany[];
  jobs: DisplayJob[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<unknown>;
};

const CompaniesDataContext = createContext<CompaniesDataValue | undefined>(undefined);

async function loadCompaniesData() {
  const raw = await fetchRawCompanies();
  return {
    companies: mapDisplayCompanies(raw),
    jobs: mapDisplayJobs(raw),
  };
}

/**
 * Fetches /v1/companies/public once and caches the derived company/job payload.
 * All pages/hooks read from the same React Query cache.
 */
export function CompaniesDataProvider({ children }: { children: React.ReactNode }) {
  const query = useQuery({
    queryKey: ["companies-data"],
    queryFn: loadCompaniesData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const companies = query.data?.companies ?? [];
  const jobs = query.data?.jobs ?? [];
  const loading = query.isLoading || (query.isFetching && !query.data);
  const error = query.error ? "Failed to load data. Please try again." : null;

  const refetch = useCallback(() => query.refetch(), [query]);

  return (
    <CompaniesDataContext.Provider value={{ companies, jobs, loading, error, refetch }}>
      {children}
    </CompaniesDataContext.Provider>
  );
}

export function useCompaniesData(): CompaniesDataValue {
  const context = useContext(CompaniesDataContext);
  if (!context) {
    throw new Error("useCompaniesData must be used within a CompaniesDataProvider");
  }
  return context;
}
