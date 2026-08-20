export type Job = {
  id: number | string;
  title: string;
  company: string;
  companyName?: string;
  companyId?: number | string;
  companyLogo?: string;
  location: string;
  workType?: string;
  jobType?: string;
  type?: string;
  category?: string;
  experienceLevel?: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  } | string;
  description: string;
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  postedDate?: string;
  applicationDeadline?: string;
  applicationsCount?: number;
  featured?: boolean;
  urgent?: boolean;
  remote?: boolean;
  status?: string;
};

export type Company = {
  id: number | string;
  name: string;
  logo?: string;
  industry?: string;
  size?: string;
  rating?: number;
  locations?: string[];
  location?: string;
  founded?: number;
  description?: string;
  employees?: number;
  website?: string;
  jobs?: Job[];
};

/** Normalized job for display */
export type DisplayJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  salaryMin: number;
  description: string;
  tags: string[];
  category: string;
  experienceLevel: string;
  workType: string;
  remote: boolean;
  postedDate: string | null;
};

/** Normalized company for display */
export type DisplayCompany = {
  id: string;
  name: string;
  industry: string;
  size: string;
  employees: number;
  location: string;
  locations: string[];
  rating: number;
  description: string;
  logo: string;
  founded: number | null;
  openJobs: number;
};
