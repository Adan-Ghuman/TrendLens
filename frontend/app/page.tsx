import { RepoCard } from "@/components/repo-card";
import { CountdownTimer } from "@/components/countdown-timer";
import { LimitSelector } from "@/components/limit-selector";
import { PaginationControls } from "@/components/pagination-controls";
import { ProjectApproachModal } from "@/components/project-approach-modal";
import { fetchHealth, fetchTrending } from "@/lib/api";
import type { HealthResponse, TrendingResponse } from "@/lib/types";
import type { ReactNode } from "react";

export default async function HomePage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<ReactNode> {
    const searchParams = await props.searchParams;
    const page = typeof searchParams.page === "string"
        ? Math.max(1, parseInt(searchParams.page, 10) || 1)
        : 1;

    const requestedLimit = typeof searchParams.limit === "string"
        ? Number(searchParams.limit)
        : NaN;
    const limit = [10, 20, 30].includes(requestedLimit) ? requestedLimit : 10;

    let data: TrendingResponse;
    let health: HealthResponse;
    let loadError: string | null = null;

    try {
        [data, health] = await Promise.all([
            fetchTrending(page, limit),
            fetchHealth(),
        ]);
    } catch {
        loadError = "Backend API is unavailable. Check backend Vercel env vars and deployment logs.";
        data = {
            items: [],
            meta: {
                page,
                limit,
                totalItems: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
                count: 0,
                source: "https://github.com/trending",
                runId: "",
                lastSuccessfulRunAt: "",
                isStale: true,
                ageSeconds: 0,
            },
        };
        health = {
            status: "degraded",
            mongodbConnected: false,
            schedulerMode: "external",
            scheduleMinutes: 5,
            lastRun: {
                runId: null,
                status: null,
                completedAt: null,
            },
        };
    }

    return (
        <main className="page-shell">
            <header className="hero">
                <div className="hero__top">
                    <div className="hero__content">
                        <div className="hero__eyebrow">GitHub trends</div>
                        <h1 className="hero__title">TrendLens</h1>
                        <p className="hero__lede">
                            A simple view of trending repositories, updated on schedule and easy to compare.
                        </p>
                    </div>
                    <ProjectApproachModal />
                </div>

                <CountdownTimer
                    initialLastSuccessfulRunAt={data.meta.lastSuccessfulRunAt}
                    initialRunId={data.meta.runId}
                    scheduleMinutes={health.scheduleMinutes}
                    initialLastRunStatus={health.lastRun.status}
                />
            </header>

            <section className="board">
                {loadError ? (
                    <div className="repo-section" role="status" aria-live="polite">
                        <div className="repo-section__header">
                            <div className="repo-section__heading">
                                <h2 className="repo-section__title">Deployment Notice</h2>
                                <p className="repo-section__subtitle">{loadError}</p>
                            </div>
                        </div>
                    </div>
                ) : null}

                <aside className="system-bar">
                    <div className="system-bar__item">
                        <span className="system-bar__label">Snapshot ID</span>
                        <strong className="system-bar__val" title={data.meta.runId || "Unavailable"}>
                            {data.meta.runId ? `${data.meta.runId.substring(0, 8)}…` : "Unavailable"}
                        </strong>
                        <span className="system-bar__desc">
                            from {data.meta.source ? new URL(data.meta.source).hostname : 'source'}
                        </span>
                    </div>

                    <div className="system-bar__item">
                        <span className="system-bar__label">Results</span>
                        <strong className="system-bar__val">{data.meta.totalItems}</strong>
                        <span className="system-bar__desc">Top repos in this fetch set</span>
                    </div>

                    <div className="system-bar__item">
                        <span className="system-bar__label">System Status</span>
                        <strong className={`system-bar__val system-bar__val--${data.meta.isStale ? "stale" : "fresh"}`}>
                            <span className="status-dot"></span>
                            {data.meta.isStale ? "Stale Data" : "Healthy"}
                        </strong>
                        <span className="system-bar__desc">
                            {data.meta.isStale ? "Beyond freshness window" : "On schedule"}
                        </span>
                    </div>
                </aside>

                <section className="repo-section repo-section--repos" aria-label="Trending repositories section">
                    <div className="repo-section__header">
                        <div className="repo-section__heading">
                            <h2 className="repo-section__title">Trending Repositories</h2>
                            <p className="repo-section__subtitle">Sorted by stars descending, then repository ID ascending.</p>
                        </div>
                        <LimitSelector currentLimit={limit} />
                    </div>

                    <section className="repo-grid" aria-label="Trending repositories">
                        <div className="repo-grid__loading-indicator" aria-hidden="true">
                            <span className="activity-indicator" />
                        </div>
                        {data.items.map((item, index) => (
                            <RepoCard
                                key={`${item.repoId}-${item.runId}`}
                                item={item}
                                index={(page - 1) * 10 + index}
                            />
                        ))}
                    </section>
                </section>

                <PaginationControls
                    page={data.meta.page}
                    totalPages={data.meta.totalPages}
                    limit={data.meta.limit}
                    hasPrevPage={data.meta.hasPrevPage}
                    hasNextPage={data.meta.hasNextPage}
                />
            </section>
        </main>
    );
}
