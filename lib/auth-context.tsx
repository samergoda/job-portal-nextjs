"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import axios, { AxiosError } from "axios";

type UserRole = "ROLE_JOB_SEEKER" | "ROLE_EMPLOYER" | "ROLE_ADMIN" | "jobSeeker" | "employer" | "admin";

type AuthUser = {
  id?: number | string;
  userId?: number | string;
  email?: string;
  name?: string;
  phone?: string;
  mobileNumber?: string;
  title?: string;
  company?: string;
  role?: UserRole;
  profileComplete?: boolean;
  [key: string]: unknown;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isEmployer: boolean;
  isJobSeeker: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, userType?: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logout: () => void;
  register: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if there's a valid session via the httpOnly cookie
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get<{ user: AuthUser | null }>("/api/auth/me", {
          withCredentials: true,
        });
        if (res.data?.user) {
          setUser(res.data.user);
        }
      } catch {
        // No valid session — user stays null
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string, _userType?: string) => {
    setIsLoading(true);

    try {
      const res = await axios.post(
        "/api/auth/login",
        { username: email, password },
        { withCredentials: true }
      );

      if (res.data?.user) {
        const userData = res.data.user;
        const userWithRole: AuthUser = {
          ...userData,
          phone: userData.mobileNumber,
          role: userData.role,
        };
        setUser(userWithRole);
        setIsLoading(false);
        return { success: true, user: userWithRole };
      }

      setIsLoading(false);
      return { success: false, error: "Invalid response from server" };
    } catch (error: unknown) {
      setIsLoading(false);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error?: string; message?: string }>;

        if (axiosError.response) {
          return {
            success: false,
            error: axiosError.response.data?.error || `Authentication failed (${axiosError.response.status})`,
          };
        }

        if (axiosError.request) {
          return {
            success: false,
            error: "Cannot connect to server. Please check if backend is running.",
          };
        }
      }

      return { success: false, error: "An unexpected error occurred" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch {
      // Best-effort — cookie will expire anyway
    }
    setUser(null);
  }, []);

  const register = useCallback(async (data: Record<string, unknown>) => {
    try {
      await axios.post("/api/proxy/auth/register", data, { withCredentials: true });
      return { success: true };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        return {
          success: false,
          error: axiosError.response?.data?.message || "Registration failed",
        };
      }
      return { success: false, error: "Registration failed" };
    }
  }, []);

  const isEmployer = user?.role === "ROLE_EMPLOYER" || user?.role === "employer";
  const isJobSeeker = user?.role === "ROLE_JOB_SEEKER" || user?.role === "jobSeeker";
  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "admin";

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isEmployer,
      isJobSeeker,
      isAdmin,
      login,
      logout,
      register,
    }),
    [user, isLoading, isEmployer, isJobSeeker, isAdmin, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
