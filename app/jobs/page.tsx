"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/sections/job-card";
import { JobCardSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useJobs } from "@/lib/hooks/use-jobs";

const JOBS_PER_PAGE = 12;

export default function JobsPage() {
  const { jobs, loading, error, refetch } = useJobs();

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("");
  const [salaryMinFilter, setSalaryMinFilter] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);

  // Derive unique filter options from data
  const categories = useMemo(
    () => [...new Set(jobs.map((j) => j.category).filter(Boolean))].sort(),
    [jobs]
  );
  const experienceLevels = useMemo(
    () => [...new Set(jobs.map((j) => j.experienceLevel).filter(Boolean))].sort(),
    [jobs]
  );
  const workTypes = useMemo(
    () => [...new Set(jobs.map((j) => j.workType).filter(Boolean))].sort(),
    [jobs]
  );

  // Filter and sort
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter((job) => {
      const matchesSearch =
        !searchTerm ||
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        !locationFilter ||
        job.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesCategory = !categoryFilter || job.category === categoryFilter;
      const matchesExperience = !experienceFilter || job.experienceLevel === experienceFilter;
      const matchesWorkType = !workTypeFilter || job.workType === workTypeFilter;
      const matchesSalary = !salaryMinFilter || job.salaryMin >= parseInt(salaryMinFilter);
      const matchesRemote = !remoteOnly || job.remote;

      return matchesSearch && matchesLocation && matchesCategory &&
        matchesExperience && matchesWorkType && matchesSalary && matchesRemote;
    });

    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => {
          if (!a.postedDate || !b.postedDate) return 0;
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        });
        break;
      case "salary-high":
        filtered.sort((a, b) => b.salaryMin - a.salaryMin);
        break;
      case "salary-low":
        filtered.sort((a, b) => a.salaryMin - b.salaryMin);
        break;
      case "company":
        filtered.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [jobs, searchTerm, locationFilter, categoryFilter, experienceFilter, workTypeFilter, salaryMinFilter, remoteOnly, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setCategoryFilter("");
    setExperienceFilter("");
    setWorkTypeFilter("");
    setSalaryMinFilter("");
    setRemoteOnly(false);
    setSortBy("recent");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || locationFilter || categoryFilter || experienceFilter ||
    workTypeFilter || salaryMinFilter || remoteOnly || sortBy !== "recent";

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateFilter = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Find Your <span className="text-primary">Perfect Job</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore {jobs.length > 0 ? jobs.length : 0} job opportunities from top companies worldwide
        </p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 rounded-lg border border-border bg-card p-4 shadow-sm">
        {/* Search row */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Job title, company, or keywords..."
              value={searchTerm}
              onChange={(e) => updateFilter(setSearchTerm)(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="City, state, or country..."
              value={locationFilter}
              onChange={(e) => updateFilter(setLocationFilter)(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
            />
          </div>
        </div>

        {/* Dropdown filters row */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <select
            value={categoryFilter}
            onChange={(e) => updateFilter(setCategoryFilter)(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={experienceFilter}
            onChange={(e) => updateFilter(setExperienceFilter)(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
          >
            <option value="">All Experience</option>
            {experienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <select
            value={workTypeFilter}
            onChange={(e) => updateFilter(setWorkTypeFilter)(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
          >
            <option value="">All Work Types</option>
            {workTypes.map((wt) => (
              <option key={wt} value={wt}>
                {wt}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min Salary ($)"
            value={salaryMinFilter}
            onChange={(e) => updateFilter(setSalaryMinFilter)(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
          />
        </div>

        {/* Bottom row: Remote toggle + Clear | Sort */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* Remote only toggle */}
            <label className="flex cursor-pointer items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={remoteOnly}
                onClick={() => { setRemoteOnly(!remoteOnly); setCurrentPage(1); }}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${
                  remoteOnly ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                    remoteOnly ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-sm text-foreground">Remote Only</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => updateFilter(setSortBy)(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
            >
              <option value="recent">Most Recent</option>
              <option value="salary-high">Salary: High to Low</option>
              <option value="salary-low">Salary: Low to High</option>
              <option value="company">Company Name</option>
              <option value="title">Job Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && !error && jobs.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * JOBS_PER_PAGE + 1, filteredJobs.length)}–{Math.min(currentPage * JOBS_PER_PAGE, filteredJobs.length)} of {filteredJobs.length} jobs
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-6 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredJobs.length === 0 && (
        <div className="mt-6 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {jobs.length === 0
              ? "No jobs available at the moment."
              : "No jobs match your filters."}
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && filteredJobs.length > 0 && (
        <>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
