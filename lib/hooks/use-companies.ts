"use client";

import { useState, useEffect, useCallback } from "react";
import type { DisplayCompany, DisplayJob } from "@/lib/types";
import { fetchDisplayCompanies, fetchDisplayCompanyById } from "@/lib/services/data-service";

export function useCompanies() {
  const [companies, setCompanies] = useState<DisplayCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDisplayCompanies();
      setCompanies(data);
    } catch (err: any) {
      console.error("[useCompanies] Failed to fetch companies:", err);
      setError("Failed to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { companies, loading, error, refetch: load };
}

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
      } catch (err: any) {
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
