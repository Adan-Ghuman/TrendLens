"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

type PaginationControlsProps = {
    page: number;
    totalPages: number;
    limit: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
};

export const PaginationControls = ({
    page,
    totalPages,
    limit,
    hasPrevPage,
    hasNextPage,
}: PaginationControlsProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const wasPendingRef = useRef(false);

    useEffect(() => {
        const root = document.documentElement;

        if (isPending) {
            root.setAttribute("data-repo-loading", "true");
        } else {
            if (wasPendingRef.current) {
                root.removeAttribute("data-repo-loading");
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }

        wasPendingRef.current = isPending;

        return () => {
            root.removeAttribute("data-repo-loading");
        };
    }, [isPending]);

    const navigateTo = (targetPage: number) => {
        startTransition(() => {
            router.push(`/?page=${targetPage}&limit=${limit}`, { scroll: false });
        });
    };

    return (
        <nav className="pagination" aria-label="Pagination">
            {hasPrevPage ? (
                <button
                    type="button"
                    className={`btn${isPending ? " btn--disabled" : ""}`}
                    onClick={() => navigateTo(page - 1)}
                    disabled={isPending}
                >
                    Previous
                </button>
            ) : (
                <span className="btn btn--disabled">Previous</span>
            )}

            <span className="pagination__info">{`Page ${page} of ${totalPages}`}</span>

            {hasNextPage ? (
                <button
                    type="button"
                    className={`btn${isPending ? " btn--disabled" : ""}`}
                    onClick={() => navigateTo(page + 1)}
                    disabled={isPending}
                >
                    Next
                </button>
            ) : (
                <span className="btn btn--disabled">Next</span>
            )}
        </nav>
    );
};
