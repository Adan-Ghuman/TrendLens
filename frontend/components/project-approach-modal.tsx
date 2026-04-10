"use client";

import { useEffect, useRef, useState } from "react";

const FOCUSABLE_SELECTOR =
    "button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])";

export const ProjectApproachModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const closeBtnRef = useRef<HTMLButtonElement | null>(null);

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        closeBtnRef.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeModal();
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const container = containerRef.current;
            if (!container) {
                return;
            }

            const focusables = Array.from(
                container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
            ).filter((node) => !node.hasAttribute("disabled"));

            if (focusables.length === 0) {
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first?.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen]);

    return (
        <>
            <button
                type="button"
                className="approach-trigger"
                onClick={openModal}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls="project-approach-dialog"
            >
                How it works
            </button>

            {isOpen ? (
                <div
                    className="approach-modal-backdrop"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        ref={containerRef}
                        id="project-approach-dialog"
                        className="approach-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="project-approach-title"
                        aria-describedby="project-approach-description"
                    >
                        <div className="approach-modal__header">
                            <div>
                                <h2 id="project-approach-title" className="approach-modal__title">
                                    How it works
                                </h2>
                                <p className="approach-modal__intro">
                                    Quick overview of how data flows in production and why I designed it this way.
                                </p>
                            </div>
                            <button
                                ref={closeBtnRef}
                                type="button"
                                className="approach-modal__close"
                                aria-label="Close project approach dialog"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>

                        <div id="project-approach-description" className="approach-modal__body">
                            <section className="approach-section">
                                <h3 className="approach-section__title">How it works</h3>
                                <ul className="approach-section__list">
                                    <li>I scrape GitHub Trending to pull in the latest repositories.</li>
                                    <li>In production, a GitHub Actions cron job runs every 5 minutes and calls a protected <strong>POST /api/scrape</strong> endpoint.</li>
                                    <li>Each run creates a fresh snapshot and promotes it as the active one.</li>
                                    <li>Instead of fetching on every page load, I store the results and reuse them.</li>
                                    <li>The API reads from that stored data and sends it to the dashboard with pagination.</li>
                                    <li>The dashboard shows the latest snapshot along with basic status details.</li>
                                </ul>
                            </section>

                            <section className="approach-section">
                                <h3 className="approach-section__title">Thinking Process</h3>
                                <ul className="approach-section__list">
                                    <li>I split the work into scraper, scheduler, API, and frontend so each part stayed easy to reason about.</li>
                                    <li>I kept it simple on purpose instead of building something more complicated than I needed.</li>
                                    <li>I avoided real-time updates because a stored snapshot was enough for this use case.</li>
                                    <li>I kept the UI focused on clarity and scanability, not extra decoration.</li>
                                    <li>I used agents to help me move faster, but I still made the actual decisions myself.</li>
                                </ul>
                            </section>

                            <section className="approach-section">
                                <h3 className="approach-section__title">Tech Stack</h3>
                                <ul className="approach-section__list">
                                    <li>Bun for runtime and scripts.</li>
                                    <li>Elysia for the backend API.</li>
                                    <li>MongoDB and Mongoose for stored snapshot data.</li>
                                    <li>Cheerio for parsing GitHub Trending.</li>
                                    <li>GitHub Actions cron in production to trigger scrape runs externally.</li>
                                    <li>node-cron for local/dev scheduled runs.</li>
                                    <li>Next.js and React for the dashboard UI.</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};
