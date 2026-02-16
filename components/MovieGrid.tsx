"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { MovieCard } from "./MovieCard";
import { useEffect, useRef, useCallback } from "react";
import { fetchMovies, fetchMovieDetails } from "@/lib/tmdb";
import { Pagination } from "./Pagination";

function MovieSkeleton() {
    return (
        <div className="aspect-[2/3] rounded-xl bg-black/5 animate-pulse border border-black/5">
            <div className="w-full h-full" />
        </div>
    )
}

import { Movie } from "@/lib/constants";

interface MovieGridProps {
    initialMovies?: Movie[];
    initialTotalResults?: number;
}

export function MovieGrid({ initialMovies, initialTotalResults, overrideMode, customMovies }: MovieGridProps & { overrideMode?: 'discover' | 'watchlist' | 'favorites' | 'watched' | 'custom', customMovies?: Movie[] }) {
    const {
        movies, setMovies, addMovies, totalResults, setTotalResults,
        selectedMoods, selectedLanguages, selectedKeywords, selectedYear, searchQuery,
        // Advanced Filters
        selectedRuntime, minRating, selectedWatchProviders, sortBy,
        watchedMovies, hideWatched, setActiveMovie,
        isLoading, setIsLoading,
        page, setPage,
        includeAdult,
        mediaMode, // Global switch
        // viewFilter, // Deprecated, using overrideMode prop
        watchlistMovies,
        likedMovies,
        lastParams, setLastParams
    } = useMovieStore();

    // const observerTarget = useRef<HTMLDivElement>(null); // Removed
    // const isLoadingRef = useRef(isLoading); // Removed
    // const pageRef = useRef(page); // Removed

    // Keep refs synced -> Removed
    // useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
    // useEffect(() => { pageRef.current = page; }, [page]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [selectedMoods, selectedLanguages, selectedKeywords, selectedYear, searchQuery, selectedRuntime, minRating, selectedWatchProviders, sortBy, setPage, mediaMode]);

    // Unified Fetch Effect with Race Condition Handling
    useEffect(() => {
        let isCancelled = false;

        // Determine effective mode: Prop overrides store (though store is deprecated for this)
        const effectiveMode = overrideMode || 'discover';

        // CUSTOM MODE LOGIC (Direct Injection)
        if (effectiveMode === 'custom') {
            if (customMovies) {
                setMovies(customMovies);
                setIsLoading(false);
            }
            return;
        }

        // LIBRARY MODE LOGIC
        if (effectiveMode !== 'discover') {
            const fetchLibrary = async () => {
                setIsLoading(true);
                // setMovies([]); // Don't clear immediately to prevent flicker, maybe?

                const targetIds = effectiveMode === 'watchlist' ? watchlistMovies :
                    effectiveMode === 'favorites' ? likedMovies :
                        watchedMovies; // fallback/watched

                // Reverse to show newest added first (assuming array append)
                const idsToFetch = [...targetIds].reverse();

                if (idsToFetch.length === 0) {
                    setMovies([]);
                    setIsLoading(false);
                    return;
                }

                try {
                    // Manual Pagination for Library? 
                    // For now, let's just slice based on page.
                    const ITEMS_PER_PAGE = 20;
                    const startIndex = (page - 1) * ITEMS_PER_PAGE;
                    const endIndex = startIndex + ITEMS_PER_PAGE;
                    const pageIds = idsToFetch.slice(startIndex, endIndex);

                    setTotalResults(idsToFetch.length);

                    const promises = pageIds.map(id => fetchMovieDetails(id).catch(() => null));
                    const results = await Promise.all(promises);

                    const validMovies = results.filter(m => m !== null) as Movie[];

                    if (!isCancelled) {
                        setMovies(validMovies);
                    }
                } catch (e) {
                    console.error("Library Fetch Error:", e);
                } finally {
                    if (!isCancelled) setIsLoading(false);
                }
            };

            fetchLibrary();
            return () => { isCancelled = true; };
        }

        // DISCOVER MODE LOGIC
        const fetchData = async () => {
            // SSR HYBRID STRATEGY: 
            // If page is 1 AND we have initialMovies passed from server (and no active client filters),
            // we might want to skip fetch. But complex to track "active client filters" vs server params.
            // Simpler: Just fetch if not initial load or if filters changed.

            if (page === 1 && initialMovies && initialMovies.length > 0 && !isLoading) {
                // Rely on the Smart Hydration effect below to set data ? 
                // Actually, if we just mounted, Smart Hydration runs. 
                // If we change filters, page resets to 1, Smart Hydration might NOT match new params...
                // So we SHOULD fetch.
            }

            setIsLoading(true);

            try {
                // console.log(`Fetching page ${page}...`);

                const keywordIds = selectedKeywords.map(k => k.id.toString());
                const { results: fetchedMovies, totalResults } = await fetchMovies({
                    moods: selectedMoods,
                    languages: selectedLanguages,
                    userKeywords: keywordIds,
                    year: selectedYear,
                    query: searchQuery,
                    includeAdult: includeAdult,
                    page: page,
                    runtime: selectedRuntime,
                    minRating: minRating,
                    watchProviders: selectedWatchProviders,
                    sortBy: sortBy,
                    mediaMode: mediaMode
                });

                if (!isCancelled) {
                    setMovies(fetchedMovies); // REPLACE, don't append
                    setTotalResults(totalResults);
                }
            } catch (error) {
                if (!isCancelled) console.error("Failed to load movies", error);
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };

        fetchData();

        return () => {
            isCancelled = true;
        };
    }, [page, selectedMoods, selectedLanguages, selectedKeywords, selectedYear, searchQuery, selectedRuntime, minRating, selectedWatchProviders, sortBy, watchedMovies, includeAdult, setMovies, setTotalResults, setIsLoading, mediaMode, watchlistMovies, likedMovies, overrideMode, initialMovies, customMovies]);

    // KEY COMPONENT: Sync Initial Data & Smart Hydration
    useEffect(() => {
        if (initialMovies && initialMovies.length > 0) {
            // New Logic: Check if we have cached data for this exact view
            const currentParams = {
                moods: selectedMoods,
                languages: selectedLanguages,
                keywords: selectedKeywords.map(k => k.id).sort(),
                year: selectedYear,
                query: searchQuery,
                runtime: selectedRuntime,
                minRating,
                watchProviders: selectedWatchProviders.sort(),
                sortBy,
                mediaMode,
                includeAdult
            };
            const currentHash = JSON.stringify(currentParams);

            if (currentHash === lastParams && movies.length > 0) {
                // Cache Hit! - But wait, if we are on Page 2, we should probably stay there or reset?
                // The store persists 'page'.
                setIsLoading(false);
                return;
            }

            // Cache Miss or New Filter (Reset)
            setMovies(initialMovies);
            setTotalResults(initialTotalResults || 0);

            // Only reset page if it's a fresh navigation/filter change, not just a hydration
            // Actually, if initialMovies are passed, it usually means Page 1 from server.
            setPage(1);

            setIsLoading(false);
            setLastParams(currentHash);
        }
    }, [initialMovies, initialTotalResults, setMovies, setTotalResults, setPage, setIsLoading,
        selectedMoods, selectedLanguages, selectedKeywords, selectedYear, searchQuery,
        selectedRuntime, minRating, selectedWatchProviders, sortBy, mediaMode, includeAdult,
        lastParams, setLastParams, movies.length]);


    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totalPages = Math.min(500, Math.ceil(totalResults / 20)); // TMDB limit 500 pages

    return (
        <div className="flex flex-col pb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 px-4 md:px-8">
                {isLoading ? (
                    Array.from({ length: 20 }).map((_, i) => <MovieSkeleton key={i} />)
                ) : (
                    <>
                        {movies
                            .filter(movie => !hideWatched || !watchedMovies.includes(movie.id))
                            .map((movie) => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                />
                            ))}

                        {!isLoading && movies.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                                <h3 className="text-xl font-medium text-black mb-2">
                                    {hideWatched ? "All results hidden (Watched)" : "No vibe match found"}
                                </h3>
                            </div>
                        )}
                    </>
                )}
            </div>

            {!isLoading && totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
