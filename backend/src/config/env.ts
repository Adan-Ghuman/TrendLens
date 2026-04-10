import * as dotenv from "dotenv";

dotenv.config();

export interface EnvConfig {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  scrapeSourceUrl: string;
  scrapeScheduleCron: string;
  scrapeScheduleMinutes: number;
  scrapeTimeoutMs: number;
  scrapeMinItems: number;
  scrapeSchedulerMode: "in-process" | "external";
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProd = nodeEnv === "production";
const defaultCron = isProd ? "*/5 * * * *" : "*/1 * * * *";
const defaultMinutes = isProd ? 5 : 1;

export const env: EnvConfig = {
  nodeEnv,
  port: parseNumber(process.env.PORT, 3001),
  mongodbUri: process.env.MONGODB_URI ?? "",
  scrapeSourceUrl:
    process.env.SCRAPE_SOURCE_URL ?? "https://github.com/trending",
  scrapeScheduleCron: process.env.SCRAPE_SCHEDULE_CRON ?? defaultCron,
  scrapeScheduleMinutes: parseNumber(
    process.env.SCRAPE_SCHEDULE_MINUTES,
    defaultMinutes,
  ),
  scrapeTimeoutMs: parseNumber(process.env.SCRAPE_TIMEOUT_MS, 10000),
  scrapeMinItems: parseNumber(process.env.SCRAPE_MIN_ITEMS, 10),
  scrapeSchedulerMode:
    process.env.SCRAPE_SCHEDULER_MODE === "external"
      ? "external"
      : "in-process",
};

if (!env.mongodbUri) {
  throw new Error("MONGODB_URI is required");
}
