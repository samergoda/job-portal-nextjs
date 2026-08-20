"use client";

import { useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";
import { CompanyCard } from "@/components/sections/company-card";
import { CompanyCardSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useCompanies } from "@/lib/hooks/use-companies";

const COMPANIES_PER_PAGE = 12;

export default function CompaniesPage() {
  const { companies, loading, error } = useCompanies();

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);

  // Derive unique filter options from data
  const industries = useMemo(
    () => [...new Set(companies.map((c) => c.industry).filter(Boolean))].sort(),
    [companies]
  );
  const sizes = useMemo(
    () => [...new Set(companies.map((c) => c.size).filter(Boolean))].sort(),
    [companies]
  );

  // Filter and sort
  const filteredCompanies = useMemo(() => {
    let filtered = companies.filter((company) => {
      const matchesSearch =
        !searchTerm ||
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        !locationFilter ||
        company.location.toLowerCase().includes(locationFilter.toLowerCase()) ||
        company.locations.some((loc) =>
          loc.toLowerCase().includes(locationFilter.toLowerCase())
        );

      const matchesIndustry = !industryFilter || company.industry === industryFilter;
      const matchesSize = !sizeFilter || company.size === sizeFilter;
      const matchesRating = !ratingFilter || company.rating >= parseFloat(ratingFilter);

      return matchesSearch && matchesLocation && matchesIndustry && matchesSize && matchesRating;
    });

    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "jobs":
        filtered.sort((a, b) => b.openJobs - a.openJobs);
        break;
      case "founded":
        filtered.sort((a, b) => (b.founded || 0) - (a.founded || 0));
        break;
    }

    return filtered;
  }, [companies, searchTerm, locationFilter, industryFilter, sizeFilter, ratingFilter, sortBy]);

  const totalPages = Math.ceil(filteredCompanies.length / COMPANIES_PER_PAGE);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * COMPANIES_PER_PAGE,
    currentPage * COMPANIES_PER_PAGE
  );

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setIndustryFilter("");
    setSizeFilter("");
    setRatingFilter("");
    setSortBy("name");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || locationFilter || industryFilter || sizeFilter || ratingFilter || sortBy !== "name";

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to page 1 when filters change
  const updateFilter = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Top <span className="text-primary">Companies</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover {companies.length > 0 ? companies.length : ""} amazing companies actively hiring top talent
        </p>
      </div>

      {/* Filters */}
      <div className="mt-8 rounded-lg border border-border bg-card p-4 shadow-sm">
        {/* Search row */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Company name or industry..."
              value={searchTerm}
              onChange={(e) => updateFilter(setSearchTerm)(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => updateFilter(setLocationFilter)(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
            />
          </div>
        </div>

        {/* Dropdown filters row */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <select
            value={industryFilter}
            onChange={(e) => updateFilter(setIndustryFilter)(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
          >
            <option value="">All Industries</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>

          <select
            value={sizeFilter}
            onChange={(e) => updateFilter(setSizeFilter)(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
          >
            <option value="">All Sizes</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => updateFilter(setRatingFilter)(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
          >
            <option value="">All Ratings</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
            <option value="3.0">3.0+ Stars</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => updateFilter(setSortBy)(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-primary"
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="jobs">Sort by Open Jobs</option>
            <option value="founded">Sort by Founded</option>
          </select>
        </div>

        {/* Clear + count row */}
        <div className="mt-3 flex items-center justify-between">
          {hasActiveFilters ? (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-primary hover:underline"
            >
              Clear All Filters
            </button>
          ) : (
            <span />
          )}
          <p className="text-sm text-muted-foreground">
            {filteredCompanies.length} {filteredCompanies.length === 1 ? "company" : "companies"} found
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredCompanies.length === 0 && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {companies.length === 0
              ? "No companies available at the moment."
              : "No companies match your filters."}
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && !error && filteredCompanies.length > 0 && (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
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
