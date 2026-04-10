export interface ParsedRepository {
  repoId: string;
  title: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  scrapedAt: Date;
}

export interface RepositorySnapshot extends ParsedRepository {
  runId: string;
}
