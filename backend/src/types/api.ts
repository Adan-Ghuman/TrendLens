import type {RepositorySnapshot} from "./repository.js";
import type {ScrapeRunStatus} from "./scrape.js";

export interface TrendingResponseMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  lastSuccessfulRunAt: string;
  isStale: boolean;

  // Existing fields for frontend compatibility
  count: number;
  source: string;
  runId: string;
  ageSeconds: number;
}

export interface TrendingResponse {
  items: RepositorySnapshot[];
  meta: TrendingResponseMeta;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  mongodbConnected: boolean;
  schedulerMode: "in-process" | "external";
  scheduleMinutes: number;
  lastRun: {
    runId: string | null;
    status: ScrapeRunStatus | null;
    completedAt: string | null;
  };
}

export interface MetaResponse {
  scheduleMinutes: number;
  runId: string | null;
  lastSuccessfulRunAt: string | null;
  ageSeconds: number | null;
}
