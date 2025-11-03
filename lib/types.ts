export type Severity = "error" | "warn" | "info";

export interface RepoInput {
  owner: string;
  repo: string;
  branch: string;
}

export interface FileBlob {
  path: string;
  content: string;
}

export interface Finding {
  agent: "CodeReviewer" | "BugFinder" | "RefactorAdvisor";
  severity: Severity;
  filePath: string;
  line?: number;
  message: string;
  suggestion?: string;
  snippet?: string;
}

export interface AnalysisResult {
  repo: RepoInput & { url: string };
  analyzedFileCount: number;
  findings: Finding[];
}
