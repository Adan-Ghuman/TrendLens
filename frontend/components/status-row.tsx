"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type StatusRowProps = {
    lastSuccessfulRunAt: string;
    scheduleMinutes: number;
    lastRunStatus: "running" | "success" | "failed" | null;
};

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
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
};

export const StatusRow = ({
    lastSuccessfulRunAt,
    scheduleMinutes,
    lastRunStatus,
}: StatusRowProps) => {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [now, setNow] = useState(0);
    const [refreshedForRunAt, setRefreshedForRunAt] = useState<string | null>(
        null,
    );

    useEffect(() => {
        setIsMounted(true);
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const scheduleMs = Math.max(1, scheduleMinutes) * 60 * 1000;
    const lastRunMs = new Date(lastSuccessfulRunAt).getTime();
    const nextRunMs = Number.isFinite(lastRunMs) ? lastRunMs + scheduleMs : NaN;
    const remainingMs = Number.isFinite(nextRunMs) ? nextRunMs - now : NaN;

    useEffect(() => {
        if (!isMounted || lastRunStatus === "failed") {
            return;
        }

        if (!Number.isFinite(remainingMs) || remainingMs > 0) {
            return;
        }

        if (!lastSuccessfulRunAt || refreshedForRunAt === lastSuccessfulRunAt) {
            return;
        }

        setRefreshedForRunAt(lastSuccessfulRunAt);
        router.refresh();
    }, [
        isMounted,
        lastRunStatus,
        remainingMs,
        lastSuccessfulRunAt,
        refreshedForRunAt,
        router,
    ]);

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
        if (lastRunStatus === "failed") {
            return { label: "Failed", tone: "status-badge--fail" };
        }

        if (!isMounted) {
            return { label: "Checking", tone: "status-badge--warn" };
        }

        if (!Number.isFinite(remainingMs) || remainingMs < 0) {
            return { label: "Delayed", tone: "status-badge--warn" };
        }

        return { label: "Up to date", tone: "status-badge--ok" };
    }, [isMounted, lastRunStatus, remainingMs]);

    return (
        <div className="hero__meta" aria-label="System update status">
            <div className="hero__meta-item">
                <span className="stat-label">Last updated</span>
                <strong>{isMounted ? formatClock(lastSuccessfulRunAt) : "--:--"}</strong>
            </div>
            <div className="hero__meta-item">
                <span className="stat-label">Next update</span>
                <strong>{nextUpdateText}</strong>
            </div>
            <div className="hero__meta-item">
                <span className="stat-label">Status</span>
                <strong className={`status-badge ${status.tone}`}>{status.label}</strong>
            </div>
        </div>
    );
};
