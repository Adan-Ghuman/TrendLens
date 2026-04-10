"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LimitSelectorProps = {
    currentLimit: number;
};

const LIMIT_OPTIONS = [10, 20, 30] as const;

export const LimitSelector = ({ currentLimit }: LimitSelectorProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const onLimitChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("limit", value);
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="limit-selector">
            <label className="limit-selector__label" htmlFor="repos-to-fetch">
                Items:
            </label>
            <select
                id="repos-to-fetch"
                className="limit-selector__select"
                value={currentLimit}
                onChange={(event) => onLimitChange(event.target.value)}
            >
                {LIMIT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
};
