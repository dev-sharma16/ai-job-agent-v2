import { NextRequest, NextResponse } from 'next/server';
import { db } from '@job-agent/db';
import { profile as profileTable, experienceEntries, projects, verifiedBullets } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { parseResume } from '@job-agent/ai';

export const dynamic = 'force-dynamic';

function normalizeEmploymentType(type: string | undefined): 'full_time' | 'part_time' | 'contract' | 'internship' {
  if (!type) return 'full_time';
  const lower = type.toLowerCase();
  if (lower.includes('intern')) return 'internship';
  if (lower.includes('contract') || lower.includes('freelance')) return 'contract';
  if (lower.includes('part')) return 'part_time';
  return 'full_time';
}

function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const lower = dateStr.toLowerCase().trim();
  if (lower === 'present' || lower === 'current') return null;
  
  // Try parsing various formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  
  // Try "Jan 2025" format
  const monthYear = dateStr.match(/^(\w{3})\s+(\d{4})$/);
  if (monthYear) {
    const months: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    const month = months[monthYear[1].toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(monthYear[2]), month, 1);
    }
  }
  
  // Try "Month 2025" format
  const fullMonthYear = dateStr.match(/^(\w+)\s+(\d{4})$/);
  if (fullMonthYear) {
    const months: Record<string, number> = { 
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, 
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const month = months[fullMonthYear[1].toLowerCase()];
    if (month !== undefined) {
      return new Date(parseInt(fullMonthYear[2]), month, 1);
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const track = formData.get('track') as 'ai_swe' | 'swe' | 'other' | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
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
      return NextResponse.json({ error: 'Resume content too short or empty' }, { status: 400 });
    }

    const parsed = await parseResume(resumeText);
    if (track && track !== 'other') {
      parsed.track = track;
    }

    // Save to database in a transaction
    const result = await db.transaction(async (tx) => {
      // 1. Save/Update Profile
      const existingProfile = await tx.query.profile.findFirst();
      const profileData = {
        name: parsed.header.name,
        email: parsed.header.email || '',
        phone: parsed.header.phone,
        location: parsed.header.location,
        linkedinUrl: parsed.header.linkedin,
        githubUrl: parsed.header.github,
        portfolioUrl: parsed.header.portfolio,
        noticePeriod: null,
        workAuthorization: null,
        expectedSalary: null,
        otherVerifiedDataJson: {},
        updatedAt: new Date(),
      };

      let profileId: string;
      if (existingProfile) {
        const updated = await tx.update(profileTable)
          .set(profileData)
          .where(eq(profileTable.id, existingProfile.id))
          .returning({ id: profileTable.id });
        profileId = updated[0].id;
      } else {
        const inserted = await tx.insert(profileTable).values(profileData).returning({ id: profileTable.id });
        profileId = inserted[0].id;
      }

      // 2. Save Experience Entries
      const experienceIds: string[] = [];
      for (const exp of parsed.experience) {
        const inserted = await tx.insert(experienceEntries).values({
          company: exp.company,
          role: exp.role,
          employmentType: normalizeEmploymentType(exp.employmentType),
          startDate: parseDate(exp.startDate) || new Date(),
          endDate: parseDate(exp.endDate),
          location: exp.location,
          description: exp.bullets.join('\n'),
          verified: true,
        }).returning({ id: experienceEntries.id });
        experienceIds.push(inserted[0].id);
      }

      // 3. Save Projects
      for (const proj of parsed.projects) {
        await tx.insert(projects).values({
          name: proj.name,
          description: proj.description || '',
          technologiesJson: proj.technologies,
          verified: true,
        });
      }

      // 4. Save Verified Bullets from experience
      for (let i = 0; i < parsed.experience.length; i++) {
        const exp = parsed.experience[i];
        const expId = experienceIds[i];
        for (const bullet of exp.bullets) {
          await tx.insert(verifiedBullets).values({
            experienceId: expId,
            text: bullet,
            trackTagsJson: [parsed.track],
            skillTagsJson: [],
            sourceReference: exp.company,
            verified: true,
          });
        }
      }

      // 5. Save Verified Bullets from projects
      for (const proj of parsed.projects) {
        for (const bullet of proj.bullets) {
          await tx.insert(verifiedBullets).values({
            text: bullet,
            trackTagsJson: [parsed.track],
            skillTagsJson: proj.technologies,
            sourceReference: proj.name,
            verified: true,
          });
        }
      }

      return { profileId, experienceCount: parsed.experience.length, projectCount: parsed.projects.length };
    });

    return NextResponse.json({
      parsed,
      saved: result,
      message: `Full resume imported: ${result.experienceCount} experience entries, ${result.projectCount} projects`,
    });
  } catch (error) {
    console.error('Full resume import error:', error);
    return NextResponse.json(
      { error: 'Failed to import full resume. Please check the file and try again.' },
      { status: 500 }
    );
  }
}