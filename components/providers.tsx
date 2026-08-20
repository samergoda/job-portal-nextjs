"use client";

import { AuthProvider } from "@/lib/auth-context";
import { JobProvider } from "@/lib/job-context";
import { ThemeProvider } from "@/lib/theme-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <JobProvider>{children}</JobProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
