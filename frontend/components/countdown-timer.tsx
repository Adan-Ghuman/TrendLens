"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { getApiBaseUrl } from "@/lib/api";

type CountdownTimerProps = {
    initialLastSuccessfulRunAt: string;
    initialRunId: string;
    scheduleMinutes: number;
    initialLastRunStatus: "running" | "success" | "failed" | null;
};

type HealthResponse = {
    lastRun: {
        runId: string | null;
        status: "running" | "success" | "failed" | null;
        completedAt: string | null;
    };
};

const POLL_INTERVAL_MS = 30_000;

const formatClock = (iso: string): string => {
    if (!iso) {
        return "Unknown";
    }

    const date = new Date(iso);
    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
};

const formatDuration = (ms: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

export const CountdownTimer = ({
    initialLastSuccessfulRunAt,
    initialRunId,
    scheduleMinutes,
    initialLastRunStatus,
}: CountdownTimerProps) => {
    const router = useRouter();
    const [isRefreshing, startTransition] = useTransition();
    const [isMounted, setIsMounted] = useState(false);
    const [now, setNow] = useState(0);
    const [lastSeenRunId, setLastSeenRunId] = useState(initialRunId);
    const [lastCountdownRefreshCycle, setLastCountdownRefreshCycle] = useState<number>(-1);
    const [lastKnownStatus, setLastKnownStatus] = useState(initialLastRunStatus);
    const previousRunIdRef = useRef(initialRunId);
    const [countdownStartMs, setCountdownStartMs] = useState(() =>
        new Date(initialLastSuccessfulRunAt).getTime(),
    );

    useEffect(() => {
        setIsMounted(true);
        setNow(Date.now());

        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const triggerRefresh = () => {
        startTransition(() => {
            router.refresh();
        });
    };

    useEffect(() => {
        const parsedLastRunMs = new Date(initialLastSuccessfulRunAt).getTime();
        if (!Number.isFinite(parsedLastRunMs)) {
            setCountdownStartMs(parsedLastRunMs);
            previousRunIdRef.current = initialRunId;
            return;
        }

        if (isMounted && initialRunId && initialRunId !== previousRunIdRef.current) {
            setCountdownStartMs(Date.now());
        } else {
            setCountdownStartMs(parsedLastRunMs);
        }

        previousRunIdRef.current = initialRunId;
    }, [initialLastSuccessfulRunAt, initialRunId, isMounted]);

    const scheduleMs = Math.max(1, scheduleMinutes) * 60 * 1000;
    const rawLastRunMs = new Date(initialLastSuccessfulRunAt).getTime();
    const nextRunMs = Number.isFinite(countdownStartMs) ? countdownStartMs + scheduleMs : NaN;
    const remainingMs = Number.isFinite(nextRunMs) ? nextRunMs - now : NaN;
    const overdueCycle = Number.isFinite(rawLastRunMs) && isMounted
        ? Math.floor(Math.max(0, now - rawLastRunMs) / scheduleMs)
        : -1;

    useEffect(() => {
        if (!isMounted || isRefreshing) {
            return;
        }

        if (!Number.isFinite(remainingMs) || remainingMs > 0) {
            return;
        }

        if (!initialLastSuccessfulRunAt || overdueCycle <= 0 || overdueCycle === lastCountdownRefreshCycle) {
            return;
        }

        setLastCountdownRefreshCycle(overdueCycle);
        triggerRefresh();
    }, [
        initialLastSuccessfulRunAt,
        isMounted,
        isRefreshing,
        lastCountdownRefreshCycle,
        overdueCycle,
        remainingMs,
    ]);

    useEffect(() => {
        if (!isMounted) {
            return;
        }

        let disposed = false;

        const pollForNewSnapshot = async () => {
            try {
                const url = new URL("/api/health", getApiBaseUrl());
                const response = await fetch(url.toString(), { cache: "no-store" });
                if (!response.ok) {
                    return;
                }

                const payload = (await response.json()) as HealthResponse;
                if (disposed) {
                    return;
                }

                setLastKnownStatus(payload.lastRun.status);

                const hasNewSuccessfulRun =
                    payload.lastRun.status === "success" &&
                    Boolean(payload.lastRun.runId) &&
                    payload.lastRun.runId !== lastSeenRunId;

                if (hasNewSuccessfulRun && payload.lastRun.runId) {
                    setLastSeenRunId(payload.lastRun.runId);
                    setCountdownStartMs(Date.now());
                    if (!isRefreshing) {
                        triggerRefresh();
                    }
                }
            } catch {
                // Silent fail keeps polling lightweight and non-blocking.
            }
        };

        const poller = setInterval(pollForNewSnapshot, POLL_INTERVAL_MS);
        return () => {
            disposed = true;
            clearInterval(poller);
        };
    }, [isMounted, isRefreshing, lastSeenRunId]);

    const nextUpdateText = useMemo(() => {
        if (!isMounted) {
            return "Calculating...";
        }

        if (!Number.isFinite(remainingMs)) {
            return "Unavailable";
        }

        if (remainingMs >= 0) {
            return `Next update in ${formatDuration(remainingMs)}`;
        }

        return `Delayed by ${formatDuration(Math.abs(remainingMs))}`;
    }, [isMounted, remainingMs]);

    const status = useMemo(() => {
        if (lastKnownStatus === "failed") {
            return { label: "Failed", tone: "status-badge--fail" };
        }

        if (!isMounted) {
            return { label: "Checking", tone: "status-badge--warn" };
        }

        if (!Number.isFinite(remainingMs) || remainingMs < 0) {
            return { label: "Delayed", tone: "status-badge--warn" };
        }

        return { label: "Up to date", tone: "status-badge--ok" };
    }, [isMounted, lastKnownStatus, remainingMs]);

    return (
        <div className="hero__meta" aria-label="System update status">
            <div className="hero__meta-item">
                <span className="stat-label">Last updated</span>
                <strong>{isMounted ? formatClock(initialLastSuccessfulRunAt) : "--:--"}</strong>
            </div>
            <div className="hero__meta-item">
                <span className="stat-label">Next update</span>
                <strong>{isRefreshing ? "Updating..." : nextUpdateText}</strong>
            </div>
            <div className="hero__meta-item">
                <span className="stat-label">Status</span>
                <strong className={`status-badge ${status.tone}`}>{status.label}</strong>
            </div>
        </div>
    );
};
