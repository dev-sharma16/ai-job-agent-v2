import { RawJob, RemoteType, EmploymentType } from '@job-agent/domain';
import { z } from 'zod';

const LeverJobSchema = z.object({
  id: z.string(),
  text: z.string(),
  categories: z.object({
    location: z.string().nullable(),
    team: z.string().nullable(),
    commitment: z.string().nullable(),
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
  applyUrl: z.string(),
  hostedUrl: z.string(),
  description: z.string(),
  lists: z.array(z.object({ text: z.string() })),
});

const LeverResponseSchema = z.object({
  data: z.array(LeverJobSchema),
});

export async function fetchLeverJobs(company: string): Promise<RawJob[]> {
  const url = `https://api.lever.co/v0/postings/${company}?mode=json`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'JobApplicationAgent/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Lever API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const parsed = LeverResponseSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(`Invalid Lever response: ${parsed.error.message}`);
  }

  return parsed.data.data.map((job) => {
    const location = job.categories.location ?? '';
    const employmentTypeStr = job.categories.commitment ?? '';

    return {
      externalId: job.id,
      companyName: '', // Will be filled by caller
      title: job.text,
      description: job.description,
      location,
      locations: location ? [location] : [],
      remoteType: location?.toLowerCase().includes('remote') ? RemoteType.REMOTE : undefined,
      employmentType: employmentTypeStr?.toLowerCase().replace(/\s+/g, '_') as
        EmploymentType | undefined,
      url: job.hostedUrl,
      applicationUrl: job.applyUrl,
      postedAt: new Date(job.createdAt),
      raw: job,
    };
  });
}
