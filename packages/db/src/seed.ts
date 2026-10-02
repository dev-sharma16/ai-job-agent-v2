import { db } from './client';
import * as schema from './schema';

async function seed() {
  console.log('Seeding database...');

  const existingProfile = await db.query.profile.findFirst();
  if (!existingProfile) {
    await db.insert(schema.profile).values({
      name: 'Dev Sharma',
      email: 'dev@example.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/devsharma',
      githubUrl: 'https://github.com/devsharma',
      portfolioUrl: 'https://devsharma.dev',
      noticePeriod: '2 weeks',
      workAuthorization: 'US Citizen',
      expectedSalary: '$180,000 - $220,000',
      otherVerifiedDataJson: {},
    });
    console.log('Created profile');
  }

  const existingSources = await db.query.sources.findMany();
  if (existingSources.length === 0) {
    await db.insert(schema.sources).values([
      {
        name: 'Greenhouse',
        type: 'greenhouse',
        baseUrl: 'https://boards-api.greenhouse.io/v1/boards',
        configJson: { boards: [] },
        enabled: true,
      },
      {
        name: 'Lever',
        type: 'lever',
        baseUrl: 'https://api.lever.co/v0/postings',
        configJson: { companies: [] },
        enabled: true,
      },
      {
        name: 'Ashby',
        type: 'ashby',
        baseUrl: 'https://api.ashbyhq.com/posting-api/job-board',
        configJson: { organizations: [] },
        enabled: true,
      },
    ]);
    console.log('Created default sources');
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
