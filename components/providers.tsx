"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, type AuthUser } from "@/lib/auth-context";
import { JobProvider } from "@/lib/job-context";
import { ThemeProvider } from "@/lib/theme-context";
import { CompaniesDataProvider } from "@/lib/companies-data-context";

export function AppProviders({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider initialUser={initialUser}>
          <CompaniesDataProvider>
            <JobProvider>{children}</JobProvider>
          </CompaniesDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
