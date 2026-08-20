import Link from "next/link";
import { Star } from "lucide-react";
import type { DisplayCompany } from "@/lib/types";

function formatEmployees(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1)}M`;
  if (count >= 1_000) return count.toLocaleString();
  return String(count);
}

export function CompanyCard({ company }: { company: DisplayCompany }) {
  return (
    <Link href={`/companies/${company.id}`}>
      <article className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
        {/* Logo + Name + Industry */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-muted p-2">
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="h-full w-full object-contain"
            />
          </div>
          <h3 className="mt-3 text-lg font-semibold text-card-foreground">{company.name}</h3>
          <p className="text-sm text-muted-foreground">{company.industry}</p>

          {/* Rating */}
          {company.rating > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(company.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">{company.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="mt-5 space-y-2.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Company Size</span>
            <span className="font-medium text-card-foreground">{company.size}</span>
          </div>
          {company.employees > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Employees</span>
              <span className="font-medium text-card-foreground">{formatEmployees(company.employees)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Open Jobs</span>
            <span className="font-medium text-primary">{company.openJobs} positions</span>
          </div>
          {company.founded && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Founded</span>
              <span className="font-medium text-card-foreground">{company.founded}</span>
            </div>
          )}
        </div>

        {/* Locations */}
        {company.locations.length > 0 && (
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">Locations</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {company.locations.map((loc) => (
                <span
                  key={loc}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {loc.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </Link>
  );
}
