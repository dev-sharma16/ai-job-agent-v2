import { NextRequest, NextResponse } from 'next/server';
import { db, applications, verifiedBullets } from '@job-agent/db';
import { eq, inArray } from 'drizzle-orm';
import { findSimilarBullets } from '@job-agent/ai';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const application = await db.query.applications.findFirst({
      where: eq(applications.id, id),
      with: {
        job: {
          with: {
            company: true,
            analysis: true,
            embeddings: true,
          },
        },
        resume: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Get selected bullets for this resume
    const resume = application.resume as any;
    const selectedBulletIds = resume.contentJson?.selectedBulletIds || [];
    const selectedBullets =
      selectedBulletIds.length > 0
        ? await db.query.verifiedBullets.findMany({
            where: (bullets, { inArray }) => inArray(bullets.id, selectedBulletIds),
          })
        : [];

    // Get similar bullets from job embedding
    let similarBullets: any[] = [];
    const job = application.job as any;
    if (job.embeddings) {
      similarBullets = await findSimilarBullets(job.embeddings.embedding as number[], {
        limit: 20,
        minSimilarity: 0.6,
      });
    }

    return NextResponse.json({
      application,
      resume: {
        ...resume,
        contentJson: {
          ...resume.contentJson,
          selectedBullets: resume.contentJson?.selectedBullets || [],
        },
      },
      selectedBullets,
      similarBullets,
    });
  } catch (error) {
    console.error('Failed to fetch review detail:', error);
    return NextResponse.json({ error: 'Failed to fetch review detail' }, { status: 500 });
  }
}
