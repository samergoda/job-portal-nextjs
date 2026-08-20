"use client";

import { useState, useEffect, useCallback } from "react";
import type { DisplayJob } from "@/lib/types";
import { fetchDisplayJobs, fetchDisplayJobById } from "@/lib/services/data-service";

export function useJobs() {
  const [jobs, setJobs] = useState<DisplayJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDisplayJobs();
      setJobs(data);
    } catch (err: any) {
      console.error("[useJobs] Failed to fetch jobs:", err);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { jobs, loading, error, refetch: load };
}

export function useJobById(id: string) {
  const [job, setJob] = useState<DisplayJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDisplayJobById(id);
        if (!cancelled) setJob(data);
      } catch (err: any) {
        if (!cancelled) setError("Failed to load job details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [id]);

  return { job, loading, error };
}
