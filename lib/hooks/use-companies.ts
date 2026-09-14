"use client";

import { useState, useEffect } from "react";
import type { DisplayCompany, DisplayJob } from "@/lib/types";
import { fetchDisplayCompanyById } from "@/lib/services/data-service";
import { useCompaniesData } from "@/lib/companies-data-context";

/**
 * Reads companies from the shared CompaniesDataProvider.
 * No network call here — the data is fetched once by the provider.
 */
export function useCompanies() {
  const { companies, loading, error, refetch } = useCompaniesData();
  return { companies, loading, error, refetch };
}

/**
 * Company detail — uses the dedicated /companies/:id endpoint which returns
 * the full company plus its jobs. This is a single call on the detail page.
 */
export function useCompanyById(id: string) {
  const [company, setCompany] = useState<(DisplayCompany & { jobs?: DisplayJob[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDisplayCompanyById(id);
        if (!cancelled) setCompany(data);
      } catch {
        if (!cancelled) setError("Failed to load company details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { company, loading, error };
}
