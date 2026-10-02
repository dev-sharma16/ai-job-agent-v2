import { generateEmbedding } from '@job-agent/ai';
import { db, jobEmbeddings, verifiedBullets, projects } from '@job-agent/db';
import { eq, sql } from 'drizzle-orm';

interface SimilarBullet {
  id: string;
  text: string;
  trackTagsJson: string[];
  skillTagsJson: string[];
  sourceReference: string;
  similarity: number;
}

export async function generateJobEmbedding(jobId: string, content: string): Promise<void> {
  const embedding = await generateEmbedding(content);
  if (embedding.length === 0) {
    throw new Error('Failed to generate embedding');
  }

  await db
    .insert(jobEmbeddings)
    .values({
      jobId,
      embedding: embedding as any,
      model: 'text-embedding-004',
      contentHash: await hashContent(content),
    })
    .onConflictDoUpdate({
      target: jobEmbeddings.jobId,
      set: {
        embedding: embedding as any,
        model: 'text-embedding-004',
        contentHash: await hashContent(content),
      },
    });
}

export async function generateBulletEmbedding(bulletId: string, text: string): Promise<void> {
  const embedding = await generateEmbedding(text);
  if (embedding.length === 0) {
    throw new Error('Failed to generate embedding');
  }

  await db
    .update(verifiedBullets)
    .set({ embedding: embedding as any, updatedAt: new Date() })
    .where(eq(verifiedBullets.id, bulletId));
}

export async function generateProjectEmbedding(projectId: string, content: string): Promise<void> {
  const embedding = await generateEmbedding(content);
  if (embedding.length === 0) {
    throw new Error('Failed to generate embedding');
  }

  await db
    .update(projects)
    .set({ embedding: embedding as any, updatedAt: new Date() })
    .where(eq(projects.id, projectId));
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function findSimilarBullets(
  jobEmbedding: number[],
  options: {
    track?: string;
    limit?: number;
    minSimilarity?: number;
  } = {}
): Promise<SimilarBullet[]> {
  const { track, limit = 20, minSimilarity = 0.7 } = options;

  let query = sql`
    SELECT 
      id,
      text,
      track_tags_json as "trackTagsJson",
      skill_tags_json as "skillTagsJson",
      source_reference as "sourceReference",
      1 - (embedding <=> ${jobEmbedding}::vector) as similarity
    FROM verified_bullets
    WHERE embedding IS NOT NULL
  `;

  if (track) {
    query = sql`${query} AND ${track} = ANY(track_tags_json)`;
  }

  query = sql`${query} AND 1 - (embedding <=> ${jobEmbedding}::vector) >= ${minSimilarity}`;
  query = sql`${query} ORDER BY similarity DESC LIMIT ${limit}`;

  const result = await db.execute(query);
  return result.rows as unknown as SimilarBullet[];
}

export async function findSimilarProjects(
  jobEmbedding: number[],
  options: {
    limit?: number;
    minSimilarity?: number;
  } = {}
): Promise<
  Array<{
    id: string;
    name: string;
    description: string;
    technologiesJson: string[];
    similarity: number;
  }>
> {
  const { limit = 10, minSimilarity = 0.7 } = options;

  const query = sql`
    SELECT 
      id,
      name,
      description,
      technologies_json as "technologiesJson",
      1 - (embedding <=> ${jobEmbedding}::vector) as similarity
    FROM projects
    WHERE embedding IS NOT NULL
    AND 1 - (embedding <=> ${jobEmbedding}::vector) >= ${minSimilarity}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  const result = await db.execute(query);
  return result.rows as Array<{
    id: string;
    name: string;
    description: string;
    technologiesJson: string[];
    similarity: number;
  }>;
}

export async function runEmbeddingGeneration(): Promise<{
  jobs: number;
  bullets: number;
  projects: number;
}> {
  console.log('Starting embedding generation...');

  let jobsProcessed = 0;
  let bulletsProcessed = 0;
  let projectsProcessed = 0;

  // Generate embeddings for jobs without them
  const jobsWithoutEmbedding = await db.execute(sql`
    SELECT j.id, j.description 
    FROM jobs j
    LEFT JOIN job_embeddings je ON je.job_id = j.id
    WHERE j.status = 'analyzed' AND je.id IS NULL
    LIMIT 50
  `);

  for (const job of jobsWithoutEmbedding.rows as Array<{ id: string; description: string }>) {
    try {
      await generateJobEmbedding(job.id, job.description);
      jobsProcessed++;
    } catch (error) {
      console.error(`Failed to generate embedding for job ${job.id}:`, error);
    }
  }

  // Generate embeddings for bullets without them
  const bulletsWithoutEmbedding = await db.query.verifiedBullets.findMany({
    where: (bullets, { isNull }) => isNull(bullets.embedding),
    limit: 100,
  });

  for (const bullet of bulletsWithoutEmbedding) {
    try {
      await generateBulletEmbedding(bullet.id, bullet.text);
      bulletsProcessed++;
    } catch (error) {
      console.error(`Failed to generate embedding for bullet ${bullet.id}:`, error);
    }
  }

  // Generate embeddings for projects without them
  const projectsWithoutEmbedding = await db.execute(sql`
    SELECT id, description 
    FROM projects 
    WHERE embedding IS NULL
    LIMIT 50
  `);

  for (const project of projectsWithoutEmbedding.rows as Array<{
    id: string;
    description: string;
  }>) {
    try {
      await generateProjectEmbedding(project.id, project.description);
      projectsProcessed++;
    } catch (error) {
      console.error(`Failed to generate embedding for project ${project.id}:`, error);
    }
  }

  console.log(
    `Embedding generation complete. Jobs: ${jobsProcessed}, Bullets: ${bulletsProcessed}, Projects: ${projectsProcessed}`
  );
  return { jobs: jobsProcessed, bullets: bulletsProcessed, projects: projectsProcessed };
}

if (require.main === module) {
  runEmbeddingGeneration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Embedding generation failed:', error);
      process.exit(1);
    });
}
