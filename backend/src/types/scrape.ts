export type ScrapeRunStatus = "running" | "success" | "failed" | "partial";

export interface ScrapeRun {
  runId: string;
  source: string;
  startedAt: Date;
  completedAt: Date | null;
  status: ScrapeRunStatus;
  itemsFetched: number;
  errorMessage: string | null;
  httpStatus: number | null;
  durationMs: number | null;
}

export interface ScrapeResult {
  runId: string;
  status: ScrapeRunStatus;
  itemsFetched: number;
  completedAt: Date;
}
