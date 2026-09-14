import httpClient, { API_ENDPOINTS } from "@/lib/api";
import type { DisplayJob, DisplayCompany, Job } from "@/lib/types";

type RawJob = {
  id: number | string;
  title?: string;
  companyName?: string;
  company?: string;
  location?: string;
  jobType?: string;
  type?: string;
  workType?: string;
  salary?: Job["salary"];
  salaryMin?: number;
  description?: string;
  requirements?: string[] | string;
  tags?: string[];
  category?: string;
  experienceLevel?: string;
  remote?: boolean;
  postedDate?: string;
};

type RawCompany = {
  id: number | string;
  name: string;
  industry?: string;
  size?: string;
  employees?: number;
  location?: string;
  locations?: string[] | string;
  rating?: number;
  description?: string;
  logo?: string;
  founded?: number;
  jobs?: RawJob[];
};

function formatSalary(salary: Job["salary"]): string {
  if (typeof salary === "string") return salary;
  const min = Math.round(salary.min / 1000);
  const max = Math.round(salary.max / 1000);
  return `$${min}k - $${max}k`;
}

function normalizeJob(job: RawJob): DisplayJob {
  const companyName = job.companyName || job.company || "Unknown";
  const jobType = job.jobType || job.type || "Full-time";
  const workType = job.workType || "On-site";
  const salary = job.salary
    ? typeof job.salary === "string"
      ? job.salary
      : formatSalary(job.salary)
    : "Competitive";

  let salaryMin = 0;
  if (job.salary && typeof job.salary !== "string") {
    salaryMin = job.salary.min || 0;
  } else if (job.salaryMin) {
    salaryMin = Number(job.salaryMin) || 0;
  }

  let tags: string[] = [];
  if (Array.isArray(job.requirements)) {
    tags = job.requirements.slice(0, 4);
  } else if (typeof job.requirements === "string") {
    try {
      const parsed: unknown = JSON.parse(job.requirements);
      tags = Array.isArray(parsed) ? (parsed as string[]).slice(0, 4) : [];
    } catch {
      tags = [];
    }
  } else if (Array.isArray(job.tags)) {
    tags = job.tags;
  }
  if (job.category && tags.length === 0) {
    tags = [job.category];
  }

  return {
    id: String(job.id),
    title: job.title || "Untitled",
    company: companyName,
    location: job.location || "Remote",
    type: jobType,
    salary,
    salaryMin,
    description: job.description || "",
    tags,
    category: job.category || "",
    experienceLevel: job.experienceLevel || "",
    workType,
    remote: Boolean(job.remote) || workType === "Remote",
    postedDate: job.postedDate || null,
  };
}

function normalizeCompany(company: RawCompany): DisplayCompany {
  const locations = company.locations
    ? Array.isArray(company.locations)
      ? company.locations
      : typeof company.locations === "string"
        ? company.locations.split(",").map((s: string) => s.trim())
        : []
    : [];
  const location = locations.length > 0 ? locations[0] : company.location || "Remote";
  const jobsArray = Array.isArray(company.jobs) ? company.jobs : [];

  return {
    id: String(company.id),
    name: company.name || "Unknown",
    industry: company.industry || "Technology",
    size: company.size || "Unknown",
    employees: company.employees || 0,
    location,
    locations,
    rating: company.rating || 0,
    description: company.description || "",
    logo: company.logo || "/logos/default.png",
    founded: company.founded || null,
    openJobs: jobsArray.length,
  };
}

/**
 * Fetches the raw companies payload from /v1/companies/public.
 * Jobs and companies are both derived from this single endpoint.
 */
export async function fetchRawCompanies(): Promise<RawCompany[]> {
  const response = await httpClient.get<RawCompany[]>(API_ENDPOINTS.COMPANIES);
  return response.data || [];
}

/** Maps a raw companies payload into display jobs. */
export function mapDisplayJobs(companies: RawCompany[]): DisplayJob[] {
  const allJobs: DisplayJob[] = [];
  for (const company of companies) {
    const jobs = Array.isArray(company.jobs) ? company.jobs : [];
    for (const job of jobs) {
      allJobs.push(normalizeJob({ ...job, companyName: job.companyName || company.name }));
    }
  }
  return allJobs;
}

/** Maps a raw companies payload into display companies. */
export function mapDisplayCompanies(companies: RawCompany[]): DisplayCompany[] {
  return companies.map(normalizeCompany);
}

export async function fetchDisplayJobs(): Promise<DisplayJob[]> {
  return mapDisplayJobs(await fetchRawCompanies());
}

export async function fetchDisplayCompanies(): Promise<DisplayCompany[]> {
  return mapDisplayCompanies(await fetchRawCompanies());
}

export async function fetchDisplayCompanyById(id: string): Promise<(DisplayCompany & { jobs?: DisplayJob[] }) | null> {
  try {
    const response = await httpClient.get<RawCompany>(API_ENDPOINTS.COMPANY_BY_ID(id));
    const company = response.data;
    if (!company) return null;

    const normalized = normalizeCompany(company);
    const jobs: DisplayJob[] = Array.isArray(company.jobs)
      ? company.jobs.map((job) => normalizeJob({ ...job, companyName: job.companyName || company.name }))
      : [];

    return { ...normalized, jobs };
  } catch {
    return null;
  }
}
