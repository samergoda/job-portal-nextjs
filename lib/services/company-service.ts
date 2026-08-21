import httpClient, { API_ENDPOINTS } from "@/lib/api";

export type CompanyRecord = {
  id: number | string;
  name: string;
  logo?: string;
  industry?: string;
  size?: string;
  rating?: number;
  locations?: string[];
  founded?: number;
  description?: string;
  employees?: number;
  website?: string;
  jobs?: Array<Record<string, unknown>>;
};

type RawJob = {
  id: number | string;
  title?: string;
  companyName?: string;
  companyId?: number | string;
  location?: string;
  workType?: string;
  jobType?: string;
  category?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  applicationsCount?: number;
};

type RawCompany = {
  id: number | string;
  name: string;
  logo?: string;
  industry?: string;
  size?: string;
  rating?: number;
  locations?: string;
  founded?: number;
  description?: string;
  employees?: number;
  website?: string;
  jobs?: RawJob[];
};

const transformJob = (job: RawJob) => ({
  ...job,
  id: job.id,
  title: job.title,
  company: job.companyName,
  companyId: job.companyId,
  location: job.location,
  workType: job.workType,
  jobType: job.jobType,
  category: job.category,
  experienceLevel: job.experienceLevel,
  salary: {
    min: Number(job.salaryMin),
    max: Number(job.salaryMax),
    currency: job.salaryCurrency,
    period: job.salaryPeriod,
  },
  description: job.description,
  requirements: (() => {
    try { return job.requirements ? JSON.parse(job.requirements) : []; } catch { return []; }
  })(),
  benefits: (() => {
    try { return job.benefits ? JSON.parse(job.benefits) : []; } catch { return []; }
  })(),
  applicationsCount: job.applicationsCount || 0,
});

export const fetchCompanies = async (): Promise<CompanyRecord[]> => {
  const response = await httpClient.get<RawCompany[]>(API_ENDPOINTS.COMPANIES);
  return (response.data || []).map((company) => ({
    ...company,
    id: company.id,
    name: company.name,
    logo: company.logo,
    industry: company.industry,
    size: company.size,
    rating: company.rating,
    locations: company.locations ? company.locations.split(",") : [],
    founded: company.founded,
    description: company.description,
    employees: company.employees,
    website: company.website,
    jobs: Array.isArray(company.jobs) ? company.jobs.map(transformJob) : [],
  }));
};

export const fetchAllJobs = async () => {
  const companies = await fetchCompanies();
  return companies.flatMap((company) => company.jobs || []);
};

export const fetchCompanyById = async (id: string | number) => {
  const response = await httpClient.get<RawCompany>(API_ENDPOINTS.COMPANY_BY_ID(id));
  return response.data;
};

export const fetchCompanyByName = async (name: string) => {
  const companies = await fetchCompanies();
  return companies.find((company) =>
    company.name.toLowerCase().replace(/[^a-z0-9]/g, "") ===
    name.toLowerCase().replace(/[^a-z0-9]/g, "")
  ) || null;
};
