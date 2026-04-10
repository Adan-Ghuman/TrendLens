import {isDatabaseConnected} from "../db/connection.js";
import {SCHEDULER} from "../config/constants.js";
import {ScrapeRunModel} from "../models/scrapeRun.model.js";
import type {HealthResponse} from "../types/api.js";

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
