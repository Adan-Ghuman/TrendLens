import {SCRAPER} from "../config/constants";
import {fetchSourceHtml} from "./fetcher";
import {parseTrendingHtml} from "./parser";
import type {ParsedRepository} from "../types/repository";
import {logger} from "../utils/logger";

export interface ScraperOutput {
  items: ParsedRepository[];
  httpStatus: number;
  durationMs: number;
}

const TRENDING_WINDOWS = ["daily", "weekly", "monthly"] as const;

const buildWindowUrls = (sourceUrl: string): string[] => {
  const source = new URL(sourceUrl);
  if (source.searchParams.has("since")) {
    return [source.toString()];
  }

  return TRENDING_WINDOWS.map((window) => {
    const url = new URL(sourceUrl);
    url.searchParams.set("since", window);
    return url.toString();
  });
};

export const runScraper = async (): Promise<ScraperOutput> => {
  const sourceUrls = buildWindowUrls(SCRAPER.sourceUrl);
  const scrapedAt = new Date();
  const byRepoId = new Map<string, ParsedRepository>();
  let totalDurationMs = 0;
  let httpStatus = 200;

  for (const sourceUrl of sourceUrls) {
    const fetched = await fetchSourceHtml(
      sourceUrl,
      SCRAPER.timeoutMs,
      SCRAPER.userAgent,
    );

    httpStatus = fetched.httpStatus;
    totalDurationMs += fetched.durationMs;

    const parsed = parseTrendingHtml(fetched.html, scrapedAt);
    for (const item of parsed) {
      if (!byRepoId.has(item.repoId)) {
        byRepoId.set(item.repoId, item);
      }
    }
  }

  const items = Array.from(byRepoId.values());

  logger.info("Merged trending windows", {
    sourcesFetched: sourceUrls.length,
    uniqueItems: items.length,
  });

  return {
    items,
    httpStatus,
    durationMs: totalDurationMs,
  };
};
