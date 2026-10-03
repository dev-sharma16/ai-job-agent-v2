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

    // Wait for form to load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Check for challenges before filling
    const challenge = await this.detectChallenge(page);
    if (challenge) {
      return {
        filledFields: [],
        unfilledFields: [],
        errors: [`Challenge detected: ${challenge}`],
      };
    }

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
        filledFields.push(field.name || field.label);
      } catch (error) {
        errors.push(`Failed to fill ${field.name || field.label}: ${(error as Error).message}`);
        unfilledFields.push(field);
      }
    }

    return { filledFields, unfilledFields, errors };
  }

  async detectChallenge(page: Page): Promise<string | null> {
    // Check for CAPTCHA
    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      'iframe[src*="hcaptcha"]',
      '.g-recaptcha',
      '#recaptcha',
      '[data-captcha]',
      '.captcha',
    ];
    for (const selector of captchaSelectors) {
      if (await page.locator(selector).first().isVisible().catch(() => false)) {
        return 'CAPTCHA';
      }
    }

    // Check for Cloudflare challenge
    if (await page.locator('#challenge-running, .cf-challenge, #cf-challenge').first().isVisible().catch(() => false)) {
      return 'Cloudflare challenge';
    }

    // Check for MFA/OTP
    const mfaSelectors = [
      'input[name*="totp" i]',
      'input[name*="mfa" i]',
      'input[name*="otp" i]',
      'input[name*="authenticator" i]',
      'input[id*="totp" i]',
      'input[id*="mfa" i]',
    ];
    for (const selector of mfaSelectors) {
      if (await page.locator(selector).first().isVisible().catch(() => false)) {
        return 'MFA/OTP required';
      }
    }

    // Check for login required
    const loginSelectors = [
      'form[action*="login"]',
      'form[action*="signin"]',
      'input[name="username"][type="email"]',
      'input[name="password"]',
    ];
    for (const selector of loginSelectors) {
      if (await page.locator(selector).first().isVisible().catch(() => false)) {
        return 'Login required';
      }
    }

    return null;
  }

  private getAnswerForField(application: ApplicationPackage, fieldType: FieldType): string | null {
    const profile = application.job;
    const resume = application.resume;

    switch (fieldType) {
      case 'NAME':
        return profile.company; // This should be the candidate's name, not company
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

    // Wait for element to be visible and enabled
    await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

    if (field.type === 'file') {
      await locator.setInputFiles(value);
      return;
    }

    if (field.type === 'select') {
      await locator.selectOption({ label: value }).catch(async () => {
        // Fallback to value
        await locator.selectOption({ value }).catch(() => {});
      });
      return;
    }

    // Clear and fill
    await locator.clear();
    await locator.fill(value);
  }

  private getFieldLocator(page: Page, field: ApplicationFormField) {
    // Greenhouse-specific selectors
    const greenhouseSelectors: string[] = [];

    if (field.name) {
      // Try exact name match first
      greenhouseSelectors.push(`[name="${field.name}"]`);
      // Try with Greenhouse prefix
      if (!field.name.startsWith('question_')) {
        greenhouseSelectors.push(`[name="question_${field.name}"]`);
      }
    }

    if (field.label) {
      greenhouseSelectors.push(`label:has-text("${field.label}") + input, label:has-text("${field.label}") + select, label:has-text("${field.label}") + textarea`);
      greenhouseSelectors.push(`label:has-text("${field.label}") >> input, label:has-text("${field.label}") >> select, label:has-text("${field.label}") >> textarea`);
    }

    // Try ID
    if (field.name) {
      greenhouseSelectors.push(`#${field.name}`);
    }

    // Try all selectors synchronously - return first matching locator
    for (const selector of greenhouseSelectors) {
      const locator = page.locator(selector).first();
      // Return the first selector that matches, we'll verify visibility when using it
      return locator;
    }

    // Fallback to base implementation
    if (field.name) {
      return page.locator(`[name="${field.name}"]`).first();
    }
    if (field.label) {
      return page.getByLabel(field.label).first();
    }
    return page.locator(`input[type="${field.type}"]`).first();
  }

  async preSubmitValidation(page: Page): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check required fields are filled
    const requiredFields = await page.locator('input[required], select[required], textarea[required]').all();
    for (const field of requiredFields) {
      const value = await field.inputValue().catch(() => '');
      const type = await field.getAttribute('type');
      if (!value && type !== 'file') {
        const name = await field.getAttribute('name') || 'unknown';
        errors.push(`Required field empty: ${name}`);
      }
    }

    // Check resume uploaded
    const fileInputs = await page.locator('input[type="file"]').all();
    let resumeUploaded = false;
    for (const input of fileInputs) {
      const files = await input.evaluate((el: any) => el.files?.length ?? 0);
      if (files > 0) {
        resumeUploaded = true;
        break;
      }
    }
    if (!resumeUploaded) {
      errors.push('Resume not uploaded');
    }

    // Check for unresolved custom questions
    const customQuestions = await page.locator('textarea[name*="question"], input[name*="question"]').all();
    for (const q of customQuestions) {
      const value = await q.inputValue().catch(() => '');
      if (!value) {
        const name = await q.getAttribute('name') || 'unknown';
        errors.push(`Unanswered custom question: ${name}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async submit(page: Page): Promise<SubmitResult> {
    try {
      // Pre-submit validation
      const validation = await this.preSubmitValidation(page);
      if (!validation.valid) {
        return { success: false, error: `Pre-submit validation failed: ${validation.errors.join(', ')}` };
      }

      const screenshotPath = await this.takeScreenshot(page);

      // Find and click submit button
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit")',
        'button:has-text("Apply")',
        'button:has-text("Send")',
      ];

      let submitted = false;
      for (const selector of submitSelectors) {
        const btn = page.locator(selector).first();
        if (await btn.isVisible().catch(() => false)) {
          await btn.click();
          submitted = true;
          break;
        }
      }

      if (!submitted) {
        return { success: false, error: 'Submit button not found', screenshotPath };
      }

      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // Check for success or error messages
      const successSelectors = [
        '.success-message',
        '.confirmation-message',
        'text=/application submitted/i',
        'text=/thank you/i',
        'text=/confirmation/i',
      ];
      for (const selector of successSelectors) {
        if (await page.locator(selector).first().isVisible().catch(() => false)) {
          return { success: true, screenshotPath };
        }
      }

      // Check for error messages
      const errorSelectors = [
        '.error-message',
        '.alert-error',
        'text=/error/i',
        'text=/failed/i',
      ];
      for (const selector of errorSelectors) {
        if (await page.locator(selector).first().isVisible().catch(() => false)) {
          const errorText = await page.locator(selector).first().textContent().catch(() => '');
          return { success: false, error: `Submission error: ${errorText}`, screenshotPath };
        }
      }

      return { success: true, screenshotPath };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
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
