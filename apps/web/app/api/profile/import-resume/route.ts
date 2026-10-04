import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@job-agent/ai';

export const dynamic = 'force-dynamic';

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const track = formData.get('track') as 'ai_swe' | 'swe' | 'other' | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = getFileExtension(file.name);
    const allowedExtensions = ['.md', '.txt', '.pdf'];
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Use Markdown (.md), Text (.txt), or PDF (.pdf)' },
        { status: 400 }
      );
    }

    let resumeText: string;

    if (ext === '.pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await pdfParse(buffer);
      resumeText = data.text;
    } else {
      resumeText = await file.text();
    }

    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json(
        { error: 'Resume content too short or empty' },
        { status: 400 }
      );
    }

    const parsed = await parseResume(resumeText);

    if (track && track !== 'other') {
      parsed.track = track;
    }

    return NextResponse.json({ parsed });
  } catch (error) {
    console.error('Resume import error:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume. Please check the file and try again.' },
      { status: 500 }
    );
  }
}