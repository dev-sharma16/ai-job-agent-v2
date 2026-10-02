import { NextRequest, NextResponse } from 'next/server';
import { db, applications, jobs, resumes } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { ResumeTrack } from '@job-agent/domain';
import { runResumeTailoring } from '@job-agent/ai';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const application = await db.query.applications.findFirst({
      where: eq(applications.id, id),
      with: {
        job: true,
        resume: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!application.job || !application.resume) {
      return NextResponse.json({ error: 'Missing job or resume' }, { status: 400 });
    }

    // Run resume tailoring again
    const job = application.job as { id: string };
    const resume = application.resume as { track: ResumeTrack };
    const result = await runResumeTailoring({
      jobId: job.id,
      resumeTrack: resume.track,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Update application with new resume
    await db.update(applications).set({ resumeId: result.resumeId }).where(eq(applications.id, id));

    return NextResponse.json({ success: true, resumeId: result.resumeId });
  } catch (error) {
    console.error('Failed to regenerate resume:', error);
    return NextResponse.json({ error: 'Failed to regenerate resume' }, { status: 500 });
  }
}
