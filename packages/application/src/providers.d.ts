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
export declare abstract class BaseProvider implements ApplicationProvider {
  abstract canHandle(url: string): boolean;
  inspect(page: Page): Promise<ApplicationForm>;
  abstract fill(page: Page, application: ApplicationPackage): Promise<FillResult>;
  submit(page: Page): Promise<SubmitResult>;
  protected extractFields(page: Page): Promise<ApplicationFormField[]>;
  protected extractFieldInfo(input: any): Promise<ApplicationFormField | null>;
  protected takeScreenshot(page: Page): Promise<string>;
  protected mapFieldType(label: string, name: string, type: string, nearbyText?: string): FieldType;
}
export declare function getProvider(url: string): BaseProvider | null;
//# sourceMappingURL=providers.d.ts.map
