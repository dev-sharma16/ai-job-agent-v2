import { RawJob, RemoteType, EmploymentType } from '@job-agent/domain';
import { z } from 'zod';

const AshbyJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string().nullable(),
  locationId: z.string().nullable(),
  employmentType: z.string().nullable(),
  department: z.string().nullable(),
  description: z.object({
    html: z.string(),
  }),
  applyUrl: z.string().nullable(),
  jobUrl: z.string().nullable(),
  isListed: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const AshbyResponseSchema = z.object({
  jobs: z.array(AshbyJobSchema),
});

export async function fetchAshbyJobs(organization: string): Promise<RawJob[]> {
  const url = `https://api.ashbyhq.com/posting-api/job-board/${organization}?includeCompensation=false`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'JobApplicationAgent/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Ashby API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const parsed = AshbyResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(`Invalid Ashby response: ${parsed.error.message}`);
  }

  return parsed.data.jobs
    .filter((job) => job.isListed)
    .map((job) => {
      const location = job.location ?? '';
      const employmentTypeStr = job.employmentType ?? '';

      return {
        externalId: job.id,
        companyName: '', // Will be filled by caller
        title: job.title,
        description: job.description.html,
        location,
        locations: location ? [location] : [],
        remoteType: location?.toLowerCase().includes('remote') ? RemoteType.REMOTE : undefined,
        employmentType: employmentTypeStr?.toLowerCase().replace(/\s+/g, '_') as
          EmploymentType | undefined,
        url: job.jobUrl ?? '',
        applicationUrl: job.applyUrl ?? '',
        postedAt: job.publishedAt ? new Date(job.publishedAt) : new Date(job.createdAt),
        raw: job,
      };
    });
}
