import { NextRequest, NextResponse } from 'next/server';
import { db, jobs, sources, companies } from '@job-agent/db';
import { eq, and, or, like, ilike, sql } from 'drizzle-orm';
import { JobFilterPolicy, EmploymentType, RemoteType, ResumeTrack } from '@job-agent/domain';

const DEFAULT_FILTER_POLICY: JobFilterPolicy = {
  allowedTracks: [ResumeTrack.AI_SWE, ResumeTrack.SWE],
  maxExperienceYears: 8,
  allowedLocations: [],
  allowRemote: true,
  excludedTitleTerms: [
    'senior',
    'staff',
    'lead',
    'principal',
    'manager',
    'director',
    'architect',
    'vp',
    'vice president',
    'head of',
    'chief',
    'cto',
    'cfo',
    'ceo',
    'intern',
    'internship',
    'co-op',
    'coop',
    'apprentice',
    'trainee',
    'entry level',
    'junior',
    'associate',
    'fellow',
  ],
  blockedCompanies: [],
  excludedEmploymentTypes: [EmploymentType.INTERNSHIP, EmploymentType.CONTRACT],
};

function parseExperience(text: string | null | undefined): number | null {
  if (!text) return null;

  const lower = text.toLowerCase();

  const patterns = [
    /(\d+)\s*\+\s*years?/,
    /(\d+)\s*-\s*(\d+)\s*years?/,
    /(\d+)\s*years?\s*(?:experience|exp)?/,
    /(\d+)\s*years?/,
    /freshers?/,
    /entry\s*level/,
    /junior/,
  ];

  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match) {
      if (lower.includes('fresher') || lower.includes('entry level') || lower.includes('junior')) {
        return 0;
      }
      if (match[1] && match[2]) {
        return Math.max(parseInt(match[1], 10), parseInt(match[2], 10));
      }
      if (match[1]) {
        return parseInt(match[1], 10);
      }
    }
  }

  return null;
}

function matchesExcludedTerms(title: string, excludedTerms: string[]): boolean {
  const lowerTitle = title.toLowerCase();
  return excludedTerms.some((term) => lowerTitle.includes(term.toLowerCase()));
}

function matchesBlockedCompanies(companyName: string, blockedCompanies: string[]): boolean {
  const lowerCompany = companyName.toLowerCase();
  return blockedCompanies.some((blocked) => lowerCompany.includes(blocked.toLowerCase()));
}

function isRemoteCompatible(
  remoteType: RemoteType | undefined,
  allowRemote: boolean,
  allowedLocations: string[]
): boolean {
  if (allowRemote && (remoteType === RemoteType.REMOTE || remoteType === RemoteType.HYBRID)) {
    return true;
  }

  if (allowedLocations.length === 0) {
    return true;
  }

  return false;
}

async function runHardFilters(policy: JobFilterPolicy = DEFAULT_FILTER_POLICY) {
  console.log('Running hard filters...');

  const unfilteredJobs = await db.query.jobs.findMany({
    where: eq(jobs.status, 'discovered'),
  });

  // Fetch companies separately
  const companyIds = [...new Set(unfilteredJobs.map((j) => j.companyId).filter(Boolean))];
  const companyMap = new Map();
  if (companyIds.length > 0) {
    const companiesList = await db.query.companies.findMany({
      where: (companies, { inArray }) => inArray(companies.id, companyIds),
      columns: { id: true, name: true },
    });
    for (const c of companiesList) {
      companyMap.set(c.id, c);
    }
  }

  console.log(`Found ${unfilteredJobs.length} jobs to filter`);

  let filtered = 0;
  let kept = 0;

  for (const job of unfilteredJobs) {
    const company = companyMap.get(job.companyId);
    let shouldFilter = false;
    let filterReason = '';

    if (matchesExcludedTerms(job.title, policy.excludedTitleTerms)) {
      shouldFilter = true;
      filterReason = 'excluded title term';
    }

    if (
      !shouldFilter &&
      company?.name &&
      matchesBlockedCompanies(company.name, policy.blockedCompanies)
    ) {
      shouldFilter = true;
      filterReason = 'blocked company';
    }

    if (!shouldFilter && policy.maxExperienceYears > 0) {
      const expText =
        job.rawJson && typeof job.rawJson === 'object' && 'description' in job.rawJson
          ? String(job.rawJson.description)
          : job.description;
      const experience = parseExperience(expText);
      if (experience !== null && experience > policy.maxExperienceYears) {
        shouldFilter = true;
        filterReason = `experience ${experience} > max ${policy.maxExperienceYears}`;
      }
    }

    if (
      !shouldFilter &&
      job.employmentType &&
      policy.excludedEmploymentTypes.includes(job.employmentType as EmploymentType)
    ) {
      shouldFilter = true;
      filterReason = `excluded employment type: ${job.employmentType}`;
    }

    if (
      !shouldFilter &&
      !isRemoteCompatible(
        job.remoteType as RemoteType | undefined,
        policy.allowRemote,
        policy.allowedLocations
      )
    ) {
      shouldFilter = true;
      filterReason = 'location mismatch';
    }

    if (shouldFilter) {
      await db
        .update(jobs)
        .set({ status: 'filtered', updatedAt: new Date() })
        .where(eq(jobs.id, job.id));
      filtered++;
      console.log(`  Filtered: ${job.title} at ${company?.name ?? 'Unknown'} - ${filterReason}`);
    } else {
      kept++;
    }
  }

  console.log(`Hard filters complete. Filtered: ${filtered}, Kept: ${kept}`);
  return { filtered, kept };
}

export async function GET() {
  return NextResponse.json(DEFAULT_FILTER_POLICY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (
      body.maxExperienceYears !== undefined &&
      (typeof body.maxExperienceYears !== 'number' || body.maxExperienceYears < 0)
    ) {
      return NextResponse.json(
        { error: 'maxExperienceYears must be a non-negative number' },
        { status: 400 }
      );
    }

    if (body.allowRemote !== undefined && typeof body.allowRemote !== 'boolean') {
      return NextResponse.json({ error: 'allowRemote must be a boolean' }, { status: 400 });
    }

    if (body.excludedTitleTerms !== undefined && !Array.isArray(body.excludedTitleTerms)) {
      return NextResponse.json({ error: 'excludedTitleTerms must be an array' }, { status: 400 });
    }

    if (body.blockedCompanies !== undefined && !Array.isArray(body.blockedCompanies)) {
      return NextResponse.json({ error: 'blockedCompanies must be an array' }, { status: 400 });
    }

    if (body.allowedLocations !== undefined && !Array.isArray(body.allowedLocations)) {
      return NextResponse.json({ error: 'allowedLocations must be an array' }, { status: 400 });
    }

    if (
      body.excludedEmploymentTypes !== undefined &&
      !Array.isArray(body.excludedEmploymentTypes)
    ) {
      return NextResponse.json(
        { error: 'excludedEmploymentTypes must be an array' },
        { status: 400 }
      );
    }

    const policy: JobFilterPolicy = {
      ...DEFAULT_FILTER_POLICY,
      ...body,
    };

    const result = await runHardFilters(policy);

    return NextResponse.json({
      policy,
      result,
    });
  } catch (error) {
    console.error('Failed to run filters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
