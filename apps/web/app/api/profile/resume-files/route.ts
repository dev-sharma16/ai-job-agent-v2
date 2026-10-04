import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const resumesDir = path.join(process.cwd(), '../../apps/resumes');
    const files = await fs.readdir(resumesDir);

    const resumeFiles = files
      .filter((f) => ['.md', '.txt', '.pdf'].includes(path.extname(f).toLowerCase()))
      .map((f) => {
        const ext = path.extname(f).toLowerCase();
        const baseName = path.basename(f, ext);
        const track = baseName.includes('ai') ? 'ai_swe' : baseName.includes('swe') ? 'swe' : 'other';
        return {
          filename: f,
          name: baseName,
          track,
          ext,
        };
      });

    return NextResponse.json({ files: resumeFiles });
  } catch (error) {
    console.error('Failed to list resume files:', error);
    return NextResponse.json({ files: [] });
  }
}