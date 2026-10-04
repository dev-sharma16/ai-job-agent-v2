import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 });
    }

    // Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const resumesDir = path.join(process.cwd(), '../../apps/resumes');
    const filePath = path.join(resumesDir, filename);

    // Verify file exists and is in the resumes directory
    const resolvedPath = path.resolve(filePath);
    const resolvedResumesDir = path.resolve(resumesDir);
    if (!resolvedPath.startsWith(resolvedResumesDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();

    let contentType = 'text/plain';
    if (ext === '.md') contentType = 'text/markdown';
    else if (ext === '.txt') contentType = 'text/plain';
    else if (ext === '.pdf') contentType = 'application/pdf';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Failed to serve resume file:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}