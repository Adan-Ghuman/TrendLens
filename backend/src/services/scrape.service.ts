import mongoose from "mongoose";
import {randomUUID} from "node:crypto";
import {SCRAPER, SCHEDULER} from "../config/constants.js";
import {RepositorySnapshotModel} from "../models/repositorySnapshot.model.js";
import {ScrapeRunModel} from "../models/scrapeRun.model.js";
import {runScraper} from "../scraper/index.js";
import type {RepositorySnapshot} from "../types/repository.js";
import type {ScrapeResult} from "../types/scrape.js";
import {logger} from "../utils/logger.js";
import {hasMinimumItems} from "../utils/validators.js";
import {promoteSnapshotRun} from "./snapshot.service.js";

const extractErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unknown scrape error";
};

const isTransactionNotSupportedError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("transaction") &&
    (message.includes("replica set") ||
      message.includes("mongos") ||
      message.includes("not supported"))
  );
};

const persistSnapshots = async (
  snapshots: RepositorySnapshot[],
  runId: string,
  completedAt: Date,
): Promise<void> => {
  const writes = snapshots.map((item) => ({
    insertOne: {
      document: item,
    },
  }));

  const persistWithoutTransaction = async (): Promise<void> => {
    await RepositorySnapshotModel.bulkWrite(writes, {
      ordered: false,
    });

    await promoteSnapshotRun(runId, completedAt, SCHEDULER.minutes);
  };

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await RepositorySnapshotModel.bulkWrite(writes, {
        ordered: false,
        session,
      });

      await promoteSnapshotRun(runId, completedAt, SCHEDULER.minutes, session);
    });
  } catch (error) {
    if (!isTransactionNotSupportedError(error)) {
      throw error;
    }
    await persistWithoutTransaction();
  } finally {
    await session.endSession();
  }
};

export const runScrapeJob = async (): Promise<ScrapeResult> => {
  const runId = randomUUID();
  const startedAt = new Date();

  await ScrapeRunModel.create({
    runId,
    source: SCRAPER.sourceUrl,
    startedAt,
    completedAt: null,
    status: "running",
    itemsFetched: 0,
    errorMessage: null,
    httpStatus: null,
    durationMs: null,
  });

  try {
    const scraped = await runScraper();
    if (!hasMinimumItems(scraped.items.length, SCRAPER.minItems)) {
      throw new Error(
        `Insufficient items fetched: ${scraped.items.length} < ${SCRAPER.minItems}`,
      );
    }

    const completedAt = new Date();
    const snapshots: RepositorySnapshot[] = scraped.items.map((item) => ({
      runId,
      repoId: item.repoId,
      title: item.title,
      description: item.description,
      language: item.language,
      stars: item.stars,
      url: item.url,
      scrapedAt: item.scrapedAt,
    }));

    await persistSnapshots(snapshots, runId, completedAt);

    await ScrapeRunModel.updateOne(
      {runId},
      {
        $set: {
          completedAt,
          status: "success",
          itemsFetched: snapshots.length,
          errorMessage: null,
          httpStatus: scraped.httpStatus,
          durationMs: scraped.durationMs,
        },
      },
    );

    logger.info("Scrape run completed", {
      runId,
      itemsFetched: snapshots.length,
      httpStatus: scraped.httpStatus,
      durationMs: scraped.durationMs,
    });

    return {
      runId,
      status: "success",
      itemsFetched: snapshots.length,
      completedAt,
    };
  } catch (error) {
    const completedAt = new Date();
    const errorMessage = extractErrorMessage(error);

    await ScrapeRunModel.updateOne(
      {runId},
      {
        $set: {
          completedAt,
          status: "failed",
          itemsFetched: 0,
          errorMessage,
        },
      },
    );

    logger.error("Scrape run failed", {runId, errorMessage});

    return {
      runId,
      status: "failed",
      itemsFetched: 0,
      completedAt,
    };
  }
};
