import type { TrendingItem } from "@/lib/types";
import type { ReactNode } from "react";

const formatStars = (stars: number): string => {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(stars);
};

interface RepoCardProps {
    item: TrendingItem;
    index: number;
}

export const RepoCard = ({ item, index }: RepoCardProps): ReactNode => {
    return (
        <article className="repo-card">
            <div className="repo-card__main">
                <div className="repo-card__header">
                    <span className="repo-card__rank">#{String(index + 1).padStart(2, "0")}</span>
                    <h2 className="repo-card__title">
                        <a href={item.url} target="_blank" rel="noreferrer">
                            {item.title}
                        </a>
                    </h2>
                </div>
                <p className="repo-card__description">
                    {item.description ?? "No description was provided."}
                </p>
            </div>

            <div className="repo-card__stats" aria-label={`Repository stats for ${item.title}`}>
                <span className="repo-card__meta-stars">★ {formatStars(item.stars)}</span>
                {item.language ? <span className="repo-card__lang">{item.language}</span> : <span className="repo-card__lang repo-card__lang--empty">No language</span>}
                <span className="repo-card__id">{item.repoId}</span>
            </div>
        </article>
    );
};
