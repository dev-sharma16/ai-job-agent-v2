import Handlebars from 'handlebars';
import { chromium } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ResumeContent } from './templates';

export interface PDFGenerationOptions {
  format?: 'letter' | 'a4';
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  printBackground?: boolean;
}

let template: ReturnType<typeof Handlebars.compile> | null = null;

async function getTemplate(): Promise<ReturnType<typeof Handlebars.compile>> {
  if (!template) {
    const templatePath = path.join(__dirname, 'templates', 'resume.hbs');
    await fs.readFile(templatePath, 'utf-8');

    Handlebars.registerHelper(
      'if',
      function (
        this: Handlebars.HelperDelegate,
        conditional: unknown,
        options: Handlebars.HelperOptions
      ) {
        if (conditional) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      }
    );

    Handlebars.registerHelper(
      'each',
      function (
        this: Handlebars.HelperDelegate,
        array: unknown[],
        options: Handlebars.HelperOptions
      ) {
        if (!array || array.length === 0) {
          return options.inverse(this);
        }
        let result = '';
        for (let i = 0; i < array.length; i++) {
          result += options.fn(array[i], {
            data: { index: i, first: i === 0, last: i === array.length - 1 },
          });
        }
        return result;
      }
    );

    Handlebars.registerHelper(
      'unless',
      function (
        this: Handlebars.HelperDelegate,
        conditional: unknown,
        options: Handlebars.HelperOptions
      ) {
        if (!conditional) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      }
    );

    template = Handlebars.compile(
      await fs.readFile(path.join(__dirname, 'templates', 'resume.hbs'), 'utf-8')
    );
  }
  return template;
}

export interface PDFGenerationOptions {
  format?: 'letter' | 'a4';
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  printBackground?: boolean;
}

export async function generateResumePDF(
  resumeContent: ResumeContent,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  const templateFn = await getTemplate();
  const html = templateFn(resumeContent);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });

    const pdf = await page.pdf({
      format: options.format || 'letter',
      margin: options.margin || {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
      printBackground: options.printBackground ?? true,
      preferCSSPageSize: true,
    });

    return pdf;
  } finally {
    await browser.close();
  }
}

export async function saveResumePDF(
  resumeContent: ResumeContent,
  outputPath: string,
  options: PDFGenerationOptions = {}
): Promise<void> {
  const pdfBuffer = await generateResumePDF(resumeContent, options);
  await fs.writeFile(outputPath, pdfBuffer);
}

export async function generateResumeHTML(resumeContent: ResumeContent): Promise<string> {
  const templateFn = await getTemplate();
  return templateFn(resumeContent);
}

(async () => {
  const outputPath = process.argv[2] || './output/resume.pdf';

  const sampleResume = {
    header: {
      name: 'Dev Sharma',
      email: 'dev@example.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/devsharma',
      github: 'https://github.com/devsharma',
      portfolio: 'https://devsharma.dev',
    },
    summary:
      'AI/ML Engineer with 6+ years of software engineering experience and 2+ years specializing in LLM applications, RAG systems, and AI agent frameworks.',
    experience: [
      {
        company: 'Tech Corp',
        role: 'Senior AI Engineer',
        employmentType: 'full_time',
        startDate: '2022-01',
        endDate: '2024-01',
        location: 'San Francisco, CA',
        bullets: [
          'Built production RAG system serving 1M+ queries/day using LangChain, Pinecone, and GPT-4',
          'Designed ML pipeline for real-time inference reducing latency by 40%',
          'Led team of 5 engineers building AI agent framework using LangGraph',
        ],
      },
    ],
    projects: [
      {
        name: 'AI Agent Framework',
        description: 'Open-source framework for building production AI agents',
        technologies: ['TypeScript', 'LangGraph', 'PostgreSQL', 'Redis'],
        bullets: [
          'Implemented multi-agent orchestration with human-in-the-loop',
          'Added support for tool calling and structured outputs',
        ],
        url: 'https://github.com/devsharma/ai-agent-framework',
      },
    ],
    skills: [
      {
        category: 'AI/ML',
        skills: [
          'LLMs',
          'RAG',
          'LangChain',
          'LangGraph',
          'Vector Databases',
          'Embeddings',
          'Prompt Engineering',
          'AI Agents',
        ],
      },
      { category: 'Languages', skills: ['TypeScript', 'Python', 'JavaScript', 'Go'] },
      { category: 'Frontend', skills: ['React', 'Next.js', 'Tailwind CSS'] },
      { category: 'Backend', skills: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'GraphQL'] },
      { category: 'Databases', skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Pinecone', 'Weaviate'] },
      { category: 'Cloud/DevOps', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'] },
    ],
    education: [
      {
        degree: 'BS Computer Science',
        institution: 'University of California, Berkeley',
        graduationDate: '2018',
        location: 'Berkeley, CA',
      },
    ],
    certifications: [],
  };

  const pdf = await generateResumePDF(sampleResume);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, pdf);
  console.log(`PDF generated at ${outputPath}`);
})().catch(console.error);
