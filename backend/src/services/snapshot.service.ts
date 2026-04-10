import type {ClientSession} from "mongoose";
import {
  SCHEDULER,
  SCRAPER,
  SORTING,
  SYSTEM_STATE_ID,
} from "../config/constants";
import {RepositorySnapshotModel} from "../models/repositorySnapshot.model";
import {SystemStateModel} from "../models/systemState.model";
import type {TrendingResponse} from "../types/api";
import type {RepositorySnapshot} from "../types/repository";
import {ageSecondsFrom} from "../utils/time";

export interface ActiveSnapshot {
  runId: string;
  updatedAt: Date;
  items: RepositorySnapshot[];
}

const toRepositorySnapshot = (
  item: Partial<RepositorySnapshot>,
): RepositorySnapshot => {
  return {
    runId: item.runId ?? "",
    repoId: item.repoId ?? "",
    title: item.title ?? "",
    description: item.description ?? null,
    language: item.language ?? null,
    stars: item.stars ?? 0,
    url: item.url ?? "",
    scrapedAt:
      item.scrapedAt instanceof Date
        ? item.scrapedAt
        : new Date(item.scrapedAt ?? 0),
  };
};

export const sortSnapshotsDeterministically = (
  items: RepositorySnapshot[],
): RepositorySnapshot[] => {
  return [...items].sort((a, b) => {
    const starsDiff = b.stars - a.stars;
    if (starsDiff !== 0) {
      return starsDiff;
    }
    return a.repoId.localeCompare(b.repoId);
  });
};

export const isSnapshotStale = (
  ageSeconds: number,
  scheduleMinutes: number,
): boolean => {
  return ageSeconds > scheduleMinutes * 2 * 60;
};

export const promoteSnapshotRun = async (
  runId: string,
  updatedAt: Date,
  scheduleMinutes: number,
  session?: ClientSession,
): Promise<void> => {
  await SystemStateModel.updateOne(
    {_id: SYSTEM_STATE_ID},
    {
      $set: {
        runId,
        updatedAt,
        scheduleMinutes,
      },
    },
    {
      upsert: true,
      session,
    },
  );
};

export const getActiveSnapshot = async (
  pageOrLimit: number,
  maybeLimit?: number,
  fetchLimit: number = Number.MAX_SAFE_INTEGER,
): Promise<{
  runId: string;
  updatedAt: Date;
  items: RepositorySnapshot[];
  totalItems: number;
} | null> => {
  // Backward compatible signature:
  // - getActiveSnapshot(limit)
  // - getActiveSnapshot(page, limit, fetchLimit)
  const page = maybeLimit === undefined ? 1 : pageOrLimit;
  const limit = maybeLimit === undefined ? pageOrLimit : maybeLimit;

  const activeState = await SystemStateModel.findById(SYSTEM_STATE_ID)
    .lean()
    .exec();

  if (!activeState) {
    return null;
  }

  const totalAvailableItems = await RepositorySnapshotModel.countDocuments({
    runId: activeState.runId,
  }).exec();

  const totalItems = Math.min(totalAvailableItems, fetchLimit);

  const skip = (page - 1) * limit;

  if (skip >= totalItems) {
    return {
      runId: activeState.runId,
      updatedAt: new Date(activeState.updatedAt),
      items: [],
      totalItems,
    };
  }

  const effectiveLimit = Math.min(limit, totalItems - skip);

  const rawItems = await RepositorySnapshotModel.find({
    runId: activeState.runId,
  })
    .sort(SORTING.starsDescRepoIdAsc)
    .skip(skip)
    .limit(effectiveLimit)
    .lean()
    .exec();

  const items = sortSnapshotsDeterministically(
    rawItems.map((item) =>
      toRepositorySnapshot(item as Partial<RepositorySnapshot>),
    ),
  );

  return {
    runId: activeState.runId,
    updatedAt: new Date(activeState.updatedAt),
    items,
    totalItems,
  };
};

export const getTrendingResponse = async (
  page: number,
  fetchLimit: number,
): Promise<TrendingResponse> => {
  const pageSize = 10;
  const snapshot = await getActiveSnapshot(page, pageSize, fetchLimit);

  if (!snapshot) {
    return {
      items: [],
      meta: {
        page,
        limit: fetchLimit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        count: 0,
        source: SCRAPER.sourceUrl,
        runId: "",
        lastSuccessfulRunAt: "",
        isStale: true,
        ageSeconds: 0,
      },
    };
  }

  const ageSeconds = ageSecondsFrom(snapshot.updatedAt);
  const isStale = isSnapshotStale(ageSeconds, SCHEDULER.minutes);
  const totalPages = Math.ceil(snapshot.totalItems / pageSize);

  return {
    items: snapshot.items,
    meta: {
      page,
      limit: fetchLimit,
      totalItems: snapshot.totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      count: snapshot.items.length,
      source: SCRAPER.sourceUrl,
      runId: snapshot.runId,
      lastSuccessfulRunAt: snapshot.updatedAt.toISOString(),
      isStale,
      ageSeconds,
    },
  };
};
