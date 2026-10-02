import {
  ApplicationProvider,
  ApplicationForm,
  ApplicationFormField,
  FillResult,
  SubmitResult,
  ApplicationPackage,
  FieldType,
} from '@job-agent/domain';
import { Page } from 'playwright';

export abstract class BaseProvider implements ApplicationProvider {
  abstract canHandle(url: string): boolean;

  async inspect(page: Page): Promise<ApplicationForm> {
    const fields = await this.extractFields(page);
    return { fields, url: page.url() };
  }

  abstract fill(page: Page, application: ApplicationPackage): Promise<FillResult>;

  async submit(page: Page): Promise<SubmitResult> {
    try {
      const screenshotPath = await this.takeScreenshot(page);
      await page.click('button[type="submit"], input[type="submit"]');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      return { success: true, screenshotPath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  protected async extractFields(page: Page): Promise<ApplicationFormField[]> {
    const fields: ApplicationFormField[] = [];

    const inputs = await page.locator('input, select, textarea').all();
    for (const input of inputs) {
      const field = await this.extractFieldInfo(input);
      if (field) fields.push(field);
    }

    return fields;
  }

  protected async extractFieldInfo(input: any): Promise<ApplicationFormField | null> {
    const tagName = await input.evaluate((el: any) => el.tagName.toLowerCase());
    const type = (await input.getAttribute('type')) ?? 'text';
    const name = (await input.getAttribute('name')) ?? '';
    const id = (await input.getAttribute('id')) ?? '';
    const placeholder = (await input.getAttribute('placeholder')) ?? '';
    const required = (await input.getAttribute('required')) !== null;

    let label = '';
    if (id) {
      const labelEl = await input.locator(`label[for="${id}"]`).first();
      if ((await labelEl.count()) > 0) {
        label = (await labelEl.textContent()) ?? '';
      }
    }

    if (!label) {
      const parentLabel = await input.locator('xpath=ancestor::label[1]').first();
      if ((await parentLabel.count()) > 0) {
        label = (await parentLabel.textContent()) ?? '';
      }
    }

    if (!label && name) {
      label = name.replace(/[_-]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    }

    const nearbyText = await input.evaluate((el: any) => {
      const parent = el.parentElement;
      return parent?.textContent?.slice(0, 200) ?? '';
    });

    let options: string[] | undefined;
    if (tagName === 'select') {
      const optionEls = await input.locator('option').all();
      options = [];
      for (const opt of optionEls) {
        const val = await opt.getAttribute('value');
        const text = await opt.textContent();
        if (val) options.push(`${val}: ${text?.trim() ?? ''}`);
      }
    }

    return {
      label: label.trim(),
      name,
      type,
      placeholder,
      required,
      options,
      nearbyText: nearbyText.trim(),
    };
  }

  protected async takeScreenshot(page: Page): Promise<string> {
    const timestamp = Date.now();
    const path = `.playwright/screenshots/submit-${timestamp}.png`;
    await page.screenshot({ path, fullPage: true });
    return path;
  }

  protected mapFieldType(
    label: string,
    name: string,
    type: string,
    nearbyText?: string
  ): FieldType {
    const combined = `${label} ${name} ${nearbyText ?? ''}`.toLowerCase();

    if (
      combined.includes('first name') ||
      combined.includes('last name') ||
      combined.includes('full name')
    )
      return 'NAME';
    if (combined.includes('email')) return 'EMAIL';
    if (combined.includes('phone') || combined.includes('mobile') || combined.includes('telephone'))
      return 'PHONE';
    if (
      combined.includes('location') ||
      combined.includes('city') ||
      combined.includes('state') ||
      combined.includes('country')
    )
      return 'LOCATION';
    if (combined.includes('linkedin')) return 'LINKEDIN';
    if (combined.includes('github')) return 'GITHUB';
    if (
      combined.includes('portfolio') ||
      combined.includes('website') ||
      combined.includes('personal site')
    )
      return 'PORTFOLIO';
    if (
      combined.includes('resume') ||
      combined.includes('cv') ||
      (combined.includes('upload') && type === 'file')
    )
      return 'RESUME';
    if (combined.includes('cover letter') || combined.includes('coverletter'))
      return 'COVER_LETTER';
    if (
      combined.includes('work authoriz') ||
      combined.includes('visa') ||
      combined.includes('citizenship')
    )
      return 'WORK_AUTHORIZATION';
    if (
      combined.includes('notice period') ||
      combined.includes('availability') ||
      combined.includes('start date')
    )
      return 'NOTICE_PERIOD';
    if (
      combined.includes('salary') ||
      combined.includes('compensation') ||
      combined.includes('pay expectation')
    )
      return 'SALARY';

    return 'CUSTOM';
  }
}

export function getProvider(url: string): BaseProvider | null {
  if (url.includes('greenhouse.io') || url.includes('boards.greenhouse.io')) {
    return new GreenhouseProvider();
  }
  if (url.includes('lever.co') || url.includes('jobs.lever.co')) {
    return new LeverProvider();
  }
  if (url.includes('ashbyhq.com') || url.includes('jobs.ashbyhq.com')) {
    return new AshbyProvider();
  }
  return null;
}

class GreenhouseProvider extends BaseProvider {
  canHandle(url: string): boolean {
    return url.includes('greenhouse.io') || url.includes('boards.greenhouse.io');
  }

  async fill(page: Page, application: ApplicationPackage): Promise<FillResult> {
    const filledFields: string[] = [];
    const unfilledFields: ApplicationFormField[] = [];
    const errors: string[] = [];

    const form = await this.inspect(page);

    for (const field of form.fields) {
      try {
        const fieldType = this.mapFieldType(field.label, field.name, field.type, field.nearbyText);
        const answer = this.getAnswerForField(application, fieldType);

        if (!answer) {
          unfilledFields.push(field);
          continue;
        }

        await this.fillField(page, field, answer);
        filledFields.push(field.name);
      } catch (error) {
        errors.push(`Failed to fill ${field.name}: ${(error as Error).message}`);
        unfilledFields.push(field);
      }
    }

    return { filledFields, unfilledFields, errors };
  }

  private getAnswerForField(application: ApplicationPackage, fieldType: FieldType): string | null {
    const profile = application.job;
    const resume = application.resume;

    switch (fieldType) {
      case 'NAME':
        return profile.company;
      case 'EMAIL':
        return 'dev@example.com';
      case 'PHONE':
        return '+1-555-0123';
      case 'LOCATION':
        return 'San Francisco, CA';
      case 'LINKEDIN':
        return 'https://linkedin.com/in/devsharma';
      case 'GITHUB':
        return 'https://github.com/devsharma';
      case 'PORTFOLIO':
        return 'https://devsharma.dev';
      case 'RESUME':
        return resume.pdfPath;
      case 'COVER_LETTER':
        return application.coverNote;
      case 'WORK_AUTHORIZATION':
        return 'US Citizen';
      case 'NOTICE_PERIOD':
        return '2 weeks';
      case 'SALARY':
        return '$180,000 - $220,000';
      default: {
        const customAnswer = application.answers.find((a) => a.fieldType === fieldType);
        return customAnswer?.answer ?? null;
      }
    }
  }

  private async fillField(page: Page, field: ApplicationFormField, value: string): Promise<void> {
    const locator = this.getFieldLocator(page, field);

    if (field.type === 'file') {
      await locator.setInputFiles(value);
      return;
    }

    if (field.type === 'select') {
      await locator.selectOption({ label: value });
      return;
    }

    await locator.fill(value);
  }

  private getFieldLocator(page: Page, field: ApplicationFormField) {
    if (field.name) {
      return page.locator(`[name="${field.name}"]`).first();
    }
    if (field.label) {
      return page.getByLabel(field.label).first();
    }
    return page.locator(`input[type="${field.type}"]`).first();
  }
}

class LeverProvider extends BaseProvider {
  canHandle(url: string): boolean {
    return url.includes('lever.co') || url.includes('jobs.lever.co');
  }

  async fill(_page: Page, _application: ApplicationPackage): Promise<FillResult> {
    return { filledFields: [], unfilledFields: [], errors: ['Not implemented'] };
  }
}

class AshbyProvider extends BaseProvider {
  canHandle(url: string): boolean {
    return url.includes('ashbyhq.com') || url.includes('jobs.ashbyhq.com');
  }

  async fill(_page: Page, _application: ApplicationPackage): Promise<FillResult> {
    return { filledFields: [], unfilledFields: [], errors: ['Not implemented'] };
  }
}
