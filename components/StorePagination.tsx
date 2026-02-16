
"use client";
import { useMovieStore } from "@/store/useMovieStore";
import { Pagination } from "./Pagination";

export function StorePagination({ initialTotalResults = 0 }: { initialTotalResults?: number }) {
    const { page, setPage, totalResults, isLoading } = useMovieStore();

    // Fallback to initial if store is empty/default
    const effectiveTotal = (totalResults === 0 && initialTotalResults > 0) ? initialTotalResults : totalResults;

    const totalPages = Math.min(500, Math.ceil(effectiveTotal / 20));

    const handlePageChange = (p: number) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Hide if loading initial page or no pages
    if (totalPages <= 1) return null;

    return (
        <div className="scale-75 origin-center md:origin-right lg:scale-90 flex items-center justify-center md:justify-end">
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
