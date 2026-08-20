import httpClient, { API_ENDPOINTS } from "@/lib/api";
import type { DisplayJob, DisplayCompany, Job, Company } from "@/lib/types";

function formatSalary(salary: Job["salary"]): string {
  if (typeof salary === "string") return salary;
  const min = Math.round(salary.min / 1000);
  const max = Math.round(salary.max / 1000);
  return `$${min}k - $${max}k`;
}

function normalizeJob(job: any): DisplayJob {
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
    try {
      const parsed = typeof job.requirements === "string" ? JSON.parse(job.requirements) : job.requirements;
      tags = Array.isArray(parsed) ? parsed.slice(0, 4) : [];
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

function normalizeCompany(company: any): DisplayCompany {
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

export async function fetchDisplayJobs(): Promise<DisplayJob[]> {
  const response = await httpClient.get(API_ENDPOINTS.COMPANIES);
  const companies: any[] = response.data || [];

  const allJobs: DisplayJob[] = [];
  for (const company of companies) {
    const jobs = Array.isArray(company.jobs) ? company.jobs : [];
    for (const job of jobs) {
      allJobs.push(normalizeJob({ ...job, companyName: job.companyName || company.name }));
    }
  }

  return allJobs;
}

export async function fetchDisplayCompanies(): Promise<DisplayCompany[]> {
  const response = await httpClient.get(API_ENDPOINTS.COMPANIES);
  const companies: any[] = response.data || [];
  return companies.map(normalizeCompany);
}

export async function fetchDisplayJobById(id: string): Promise<DisplayJob | null> {
  try {
    const jobs = await fetchDisplayJobs();
    return jobs.find((job) => job.id === id) || null;
  } catch {
    return null;
  }
}

export async function fetchDisplayCompanyById(id: string): Promise<(DisplayCompany & { jobs?: DisplayJob[] }) | null> {
  try {
    const response = await httpClient.get(API_ENDPOINTS.COMPANY_BY_ID(id));
    const company = response.data;
    if (!company) return null;

    const normalized = normalizeCompany(company);
    const jobs: DisplayJob[] = Array.isArray(company.jobs)
      ? company.jobs.map((job: any) => normalizeJob({ ...job, companyName: job.companyName || company.name }))
      : [];

    return { ...normalized, jobs };
  } catch {
    return null;
  }
}
