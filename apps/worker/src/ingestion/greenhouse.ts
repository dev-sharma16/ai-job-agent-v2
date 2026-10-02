import { RawJob, RemoteType, EmploymentType } from '@job-agent/domain';
import { z } from 'zod';

const GreenhouseJobSchema = z.object({
  id: z.number(),
  title: z.string(),
  location: z.object({ name: z.string() }).nullable(),
  metadata: z.array(z.object({ name: z.string(), value: z.string() })),
  absolute_url: z.string(),
  updated_at: z.string(),
  content: z.string(),
});

const GreenhouseBoardSchema = z.object({
  jobs: z.array(GreenhouseJobSchema),
});

export async function fetchGreenhouseJobs(boardToken: string): Promise<RawJob[]> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'JobApplicationAgent/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Greenhouse API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const parsed = GreenhouseBoardSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error(`Invalid Greenhouse response: ${parsed.error.message}`);
  }

  return parsed.data.jobs.map((job) => {
    const location = job.location?.name ?? '';
    const employmentTypeStr = job.metadata.find((m) => m.name === 'Employment Type')?.value ?? '';

    return {
      externalId: String(job.id),
      companyName: '', // Will be filled by caller
      title: job.title,
      description: job.content,
      location,
      locations: location ? [location] : [],
      remoteType: location?.toLowerCase().includes('remote') ? RemoteType.REMOTE : undefined,
      employmentType: employmentTypeStr?.toLowerCase().replace(/\s+/g, '_') as
        EmploymentType | undefined,
      url: job.absolute_url,
      applicationUrl: job.absolute_url,
      postedAt: new Date(job.updated_at),
      raw: job,
    };
  });
}
