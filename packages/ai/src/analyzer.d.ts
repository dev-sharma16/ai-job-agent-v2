import { JobAnalysis } from './schemas';
import { RawJob } from '@job-agent/domain';
export declare function analyzeJob(job: RawJob): Promise<JobAnalysis>;
export declare function getAnalysisMetadata(): {
  model: string;
  promptVersion: string;
};
//# sourceMappingURL=analyzer.d.ts.map
