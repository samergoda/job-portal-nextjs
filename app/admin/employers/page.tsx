"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/lib/auth-context";
import { fetchCompanies, type CompanyRecord } from "@/lib/services/company-service";
import {
  searchUserByEmail,
  elevateToEmployer,
  assignCompanyToEmployer,
  type ManagedUser,
} from "@/lib/services/admin-service";
import axios from "axios";

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) return "User not found with this email address";
    return (error.response?.data as { message?: string })?.message || fallback;
  }
  return fallback;
}

const roleBadgeClasses = (role: string) => {
  if (role === "ROLE_EMPLOYER") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (role === "ROLE_ADMIN") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
  return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
};

export default function AdminEmployersPage() {
  const { isAdmin, isLoading } = useAuth();

  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  const [searchEmail, setSearchEmail] = useState("");
  const [searchedUser, setSearchedUser] = useState<ManagedUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [isElevating, setIsElevating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load companies for the dropdown
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchCompanies();
        if (!cancelled) setCompanies(data);
      } catch {
        if (!cancelled) setError("Failed to load companies");
      } finally {
        if (!cancelled) setCompaniesLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setSearchedUser(null);
    setError("");
    setSuccess("");
    setSelectedCompanyId("");

    if (!searchEmail.trim()) {
      setSearchError("Please enter an email address");
      return;
    }

    try {
      setIsSearching(true);
      const user = await searchUserByEmail(searchEmail.trim());
      if (!user) {
        setSearchError("User not found with this email address");
        setSearchedUser(null);
        return;
      }
      setSearchedUser(user);
      if (user.companyId) {
        setSelectedCompanyId(String(user.companyId));
      }
    } catch (err: unknown) {
      setSearchError(getErrorMessage(err, "Failed to search user"));
    } finally {
      setIsSearching(false);
    }
  };

  const handleElevate = async () => {
    if (!searchedUser) return;
    setError("");
    setSuccess("");

    try {
      setIsElevating(true);
      const updated = await elevateToEmployer(searchedUser.userId);
      setSearchedUser(updated);
      setSuccess(`Successfully elevated ${updated.name} to Employer`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to elevate user to employer"));
    } finally {
      setIsElevating(false);
    }
  };

  const handleAssignCompany = async () => {
    setError("");
    setSuccess("");

    if (!searchedUser || !selectedCompanyId) {
      setError("Please select a company");
      return;
    }

    try {
      setIsAssigning(true);
      console.log("[assign] searchedUser:", JSON.stringify(searchedUser));
      const updated = await assignCompanyToEmployer(searchedUser.userId, parseInt(selectedCompanyId, 10));
      setSearchedUser(updated);
      setSuccess(`Successfully assigned company to ${searchedUser.name}`);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to assign company"));
    } finally {
      setIsAssigning(false);
    }
  };

  // Auth guard
  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-6 py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You need administrator privileges to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Employer Management</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search users, elevate to employer role, and assign companies
        </p>
      </div>

      {/* Search and elevate section */}
      <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-card-foreground">Search and Elevate User</h2>

        <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter user email address"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              disabled={isSearching}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isSearching}>
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search User"
            )}
          </Button>
        </form>

        {searchError && (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            {searchError}
          </p>
        )}

        {/* Searched user result */}
        {searchedUser && (
          <div className="mt-6 rounded-lg border border-border bg-background p-5">
            <h3 className="text-base font-semibold text-foreground">User Found</h3>
            
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium text-foreground">{searchedUser.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{searchedUser.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mobile Number</p>
                <p className="text-sm font-medium text-foreground">{searchedUser.mobileNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Role</p>
                <span className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClasses(searchedUser.role)}`}>
                  {searchedUser.role}
                </span>
              </div>
              {searchedUser.companyName && (
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Company</p>
                  <p className="text-sm font-medium text-foreground">{searchedUser.companyName}</p>
                </div>
              )}
              {searchedUser.createdAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(searchedUser.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Actions based on role */}
            <div className="mt-6">
              {searchedUser.role === "ROLE_JOB_SEEKER" && (
                <Button onClick={handleElevate} disabled={isElevating}>
                  {isElevating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Elevating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Elevate to Employer
                    </>
                  )}
                </Button>
              )}

              {searchedUser.role === "ROLE_EMPLOYER" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {searchedUser.companyId ? "Reassign Company" : "Assign Company"}
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      disabled={isAssigning || companiesLoading}
                      className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
                    >
                      <option value="">-- Select a company --</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    <Button onClick={handleAssignCompany} disabled={!selectedCompanyId || isAssigning}>
                      {isAssigning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Building2 className="h-4 w-4" />
                          Assign
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {searchedUser.role === "ROLE_ADMIN" && (
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Admin users cannot be elevated or assigned to companies
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Success / error messages */}
      {success && (
        <p className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
