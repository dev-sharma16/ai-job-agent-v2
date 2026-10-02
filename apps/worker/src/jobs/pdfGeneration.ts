import { db, resumes } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { saveResumePDF } from '@job-agent/resume';

export interface PDFGenerationInput {
  resumeId: string;
  outputDir?: string;
}

export interface PDFGenerationOutput {
  success: boolean;
  error?: string;
  pdfPath?: string;
}

export async function runPDFGeneration(input: PDFGenerationInput): Promise<PDFGenerationOutput> {
  try {
    const resume = await db.query.resumes.findFirst({
      where: eq(resumes.id, input.resumeId),
      with: {
        job: true,
      },
    });

    if (!resume) {
      return { success: false, error: 'Resume not found' };
    }

    const job = resume.contentJson as any;
    if (!job) {
      return { success: false, error: 'Resume content not found' };
    }

    const outputDir = input.outputDir || './output/resumes';
    await fs.mkdir(outputDir, { recursive: true });

    const fileName = `resume-${resume.track}-v${resume.version}-${resume.id.slice(0, 8)}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    await saveResumePDF(job.contentJson, outputPath);

    return { success: true, pdfPath: outputPath };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

import * as fs from 'fs/promises';
import * as path from 'path';

if (require.main === module) {
  const resumeId = process.argv[2];
  const outputDir = process.argv[3];

  if (!resumeId) {
    console.error('Usage: pnpm pdf:generate <resumeId> [outputDir]');
    process.exit(1);
  }

  runPDFGeneration({ resumeId, outputDir })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
