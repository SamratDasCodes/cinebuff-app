"use client";
import { useMovieStore } from "@/store/useMovieStore";

export function ResultCount({ initialValue = 0 }: { initialValue?: number }) {
    const { totalResults, isLoading } = useMovieStore();

    // Prefer Server Count (initialValue) if Store is still at default (0) and we haven't fetched yet?
    // Actually, simply: If Store is 0, use Initial. If Store > 0, use Store.
    // This allows the initial server value to perform the "SSR" role.
    const displayCount = (totalResults === 0 && initialValue > 0) ? initialValue : totalResults;

    if (isLoading && displayCount === 0) return (
        <span className="text-xs font-mono bg-indigo-600/50 px-2 py-1 rounded text-white/50 animate-pulse ml-2">
            Loading...
        </span>
    );

    return (
        <span className="text-xs font-mono bg-indigo-600 px-2 py-1 rounded text-white font-semibold shadow-sm ml-2">
            {displayCount.toLocaleString()} Results
        </span>
    );
}
