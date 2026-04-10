export interface TrendingItem {
  runId: string;
  repoId: string;
  title: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  scrapedAt: string;
}

export interface TrendingMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  count: number;
  source: string;
  runId: string;
  lastSuccessfulRunAt: string;
  isStale: boolean;
  ageSeconds: number;
}

export interface TrendingResponse {
  items: TrendingItem[];
  meta: TrendingMeta;
}

export interface HealthResponse {
  status: "ok" | "degraded";
  mongodbConnected: boolean;
  schedulerMode: "in-process" | "external";
  scheduleMinutes: number;
  lastRun: {
    runId: string | null;
    status: "running" | "success" | "failed" | null;
    completedAt: string | null;
  };
}
