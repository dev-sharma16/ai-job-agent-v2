// @ts-nocheck - Complex Drizzle ORM types cause false positives
import { db, jobEmbeddings, verifiedBullets, projects } from '@job-agent/db';
import { eq, sql } from 'drizzle-orm';
import { generateEmbedding } from './client';
import { hashContent } from './hash';

export interface SimilarBullet {
  id: string;
  text: string;
  trackTagsJson: string[];
  skillTagsJson: string[];
  sourceReference: string;
  similarity: number;
}

export interface SimilarProject {
  id: string;
  name: string;
  description: string;
  technologiesJson: string[];
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

export interface SimilarBullet {
  id: string;
  text: string;
  trackTagsJson: string[];
  skillTagsJson: string[];
  sourceReference: string;
  similarity: number;
}

export interface SimilarProject {
  id: string;
  name: string;
  description: string;
  technologiesJson: string[];
  similarity: number;
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
): Promise<SimilarProject[]> {
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
  return result.rows as unknown as SimilarProject[];
}
