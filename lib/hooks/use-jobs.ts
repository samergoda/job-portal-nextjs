"use client";

import { useMemo } from "react";
import type { DisplayJob } from "@/lib/types";
import { useCompaniesData } from "@/lib/companies-data-context";

/**
 * Reads jobs from the shared CompaniesDataProvider.
 * No network call here — the data is fetched once by the provider.
 */
export function useJobs() {
  const { jobs, loading, error, refetch } = useCompaniesData();
  return { jobs, loading, error, refetch };
}

export function useJobById(id: string) {
  const { jobs, loading, error } = useCompaniesData();

  const job = useMemo<DisplayJob | null>(
    () => jobs.find((j) => j.id === id) || null,
    [jobs, id]
  );

  return { job, loading, error };
}
