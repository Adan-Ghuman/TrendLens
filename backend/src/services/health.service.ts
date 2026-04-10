import {isDatabaseConnected} from "../db/connection";
import {SCHEDULER} from "../config/constants";
import {ScrapeRunModel} from "../models/scrapeRun.model";
import type {HealthResponse} from "../types/api";

export const getHealthStatus = async (): Promise<HealthResponse> => {
  const lastRun = await ScrapeRunModel.findOne()
    .sort({startedAt: -1})
    .lean()
    .exec();

  return {
    status: isDatabaseConnected() ? "ok" : "degraded",
    mongodbConnected: isDatabaseConnected(),
    schedulerMode: SCHEDULER.mode,
    scheduleMinutes: SCHEDULER.minutes,
    lastRun: {
      runId: lastRun?.runId ?? null,
      status: lastRun?.status ?? null,
      completedAt: lastRun?.completedAt
        ? new Date(lastRun.completedAt).toISOString()
        : null,
    },
  };
};
