import {env} from "./env.js";

export const COLLECTIONS = {
  scrapeRuns: "scrapeRuns",
  repositorySnapshots: "repositorySnapshots",
  systemState: "systemState",
} as const;

export const SORTING = {
  starsDescRepoIdAsc: {
    stars: -1,
    repoId: 1,
  },
} as const;

export const SCHEDULER = {
  cron: env.scrapeScheduleCron,
  minutes: env.scrapeScheduleMinutes,
  mode: env.scrapeSchedulerMode,
  shouldRunInProcess: env.scrapeSchedulerMode === "in-process",
  nodeEnv: env.nodeEnv,
  intervalDesc: `every ${env.scrapeScheduleMinutes} minute${env.scrapeScheduleMinutes === 1 ? "" : "s"}`,
} as const;

export const SCRAPER = {
  sourceUrl: env.scrapeSourceUrl,
  timeoutMs: env.scrapeTimeoutMs,
  minItems: env.scrapeMinItems,
  userAgent: "investkaar-screening-bot/1.0",
} as const;

export const SYSTEM_STATE_ID = "activeSnapshot";
