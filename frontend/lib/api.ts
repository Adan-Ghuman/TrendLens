import type {HealthResponse, TrendingResponse} from "./types";

const defaultBaseUrl = "http://localhost:3001";

export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultBaseUrl;
};

export const fetchTrending = async (
  page: number = 1,
  limit: number = 10,
): Promise<TrendingResponse> => {
  const url = new URL("/api/trending", getApiBaseUrl());
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Trending API request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<TrendingResponse>;
};

export const fetchHealth = async (): Promise<HealthResponse> => {
  const url = new URL("/health", getApiBaseUrl());
  const response = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Health API request failed with status ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
};
