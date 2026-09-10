"use client";

import { AuthProvider, type AuthUser } from "@/lib/auth-context";
import { JobProvider } from "@/lib/job-context";
import { ThemeProvider } from "@/lib/theme-context";

export function AppProviders({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  return (
    <ThemeProvider>
      <AuthProvider initialUser={initialUser}>
        <JobProvider>{children}</JobProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
