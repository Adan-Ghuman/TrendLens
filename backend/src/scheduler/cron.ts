import cron, {type ScheduledTask} from "node-cron";
import {SCHEDULER} from "../config/constants";
import {runScrapeJob} from "../services/scrape.service";
import {logger} from "../utils/logger";
import {releaseSchedulerLock, tryAcquireSchedulerLock} from "./lock";

let task: ScheduledTask | null = null;

export const startScheduler = (): ScheduledTask | null => {
  if (!SCHEDULER.shouldRunInProcess) {
    logger.info("Scheduler is configured for external execution", {
      mode: SCHEDULER.mode,
      cron: SCHEDULER.cron,
    });
    return null;
  }

  if (task) {
    return task;
  }

  task = cron.schedule(SCHEDULER.cron, async () => {
    if (!tryAcquireSchedulerLock()) {
      logger.warn("Scheduler run skipped because a run is already active", {
        mode: SCHEDULER.mode,
      });
      return;
    }

    logger.info("Scheduler run started", {
      mode: SCHEDULER.mode,
    });

    try {
      const result = await runScrapeJob();
      logger.info("Scheduler run finished", {
        mode: SCHEDULER.mode,
        runId: result.runId,
        status: result.status,
        itemsFetched: result.itemsFetched,
      });
    } finally {
      releaseSchedulerLock();
    }
  });

  logger.info(
    `Scheduler started (${SCHEDULER.nodeEnv}): ${SCHEDULER.intervalDesc}`,
    {
      mode: SCHEDULER.mode,
      cron: SCHEDULER.cron,
    },
  );

  return task;
};

export const stopScheduler = (): void => {
  task?.stop();
  task = null;
};

export const isSchedulerRunningInProcess = (): boolean => {
  return task !== null;
};
