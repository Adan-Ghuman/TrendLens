import {load} from "cheerio";
import {parseStars} from "./normalizer.js";
import type {ParsedRepository} from "../types/repository.js";

const toRepoId = (href: string | undefined): string | null => {
  if (!href) {
    return null;
  }

  const cleaned = href.split("?")[0]?.split("#")[0]?.trim() ?? "";
  const repoId = cleaned.replace(/^\/+/, "").trim();
  if (!repoId || !repoId.includes("/")) {
    return null;
  }

  return repoId;
};

const toAbsoluteUrl = (href: string | undefined): string | null => {
  if (!href) {
    return null;
  }

  try {
    return new URL(href, "https://github.com").toString();
  } catch {
    return null;
  }
};

const toTitle = (value: string | undefined, fallback: string): string => {
  const title = value?.trim().replace(/\s+/g, " ") ?? "";
  return title || fallback;
};

export const parseTrendingHtml = (
  html: string,
  scrapedAt: Date,
): ParsedRepository[] => {
  const $ = load(html);
  const items: ParsedRepository[] = [];

  $("article.Box-row").each((_, article) => {
    const href = $(article).find("h2 a").attr("href");
    const titleText = $(article).find("h2 a").first().text();
    const repoId = toRepoId(href);
    const url = toAbsoluteUrl(href);
    if (!repoId || !url) {
      return;
    }

    const descriptionText =
      $(article).find("p").first().text().trim().replace(/\s+/g, " ") || null;
    const languageText =
      $(article)
        .find("span[itemprop='programmingLanguage']")
        .first()
        .text()
        .trim() || null;
    const starsRaw = $(article)
      .find("a[href$='/stargazers']")
      .first()
      .text()
      .trim();

    items.push({
      repoId,
      title: toTitle(titleText, repoId),
      description: descriptionText,
      language: languageText,
      stars: parseStars(starsRaw),
      url,
      scrapedAt,
    });
  });

  return items;
};
