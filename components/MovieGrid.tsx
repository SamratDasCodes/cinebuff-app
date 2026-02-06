"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { MovieCard } from "./MovieCard";
import { useEffect, useRef, useCallback } from "react";
import { fetchMovies, fetchMovieDetails } from "@/lib/tmdb";

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

export function MovieGrid({ initialMovies, initialTotalResults, overrideMode }: MovieGridProps & { overrideMode?: 'discover' | 'watchlist' | 'favorites' | 'watched' }) {
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
        likedMovies
    } = useMovieStore();

    const observerTarget = useRef<HTMLDivElement>(null);
    const isLoadingRef = useRef(isLoading);
    const pageRef = useRef(page);

    // Keep refs synced
    useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
    useEffect(() => { pageRef.current = page; }, [page]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [selectedMoods, selectedLanguages, selectedKeywords, selectedYear, searchQuery, selectedRuntime, minRating, selectedWatchProviders, sortBy, setPage, mediaMode]);

    // Unified Fetch Effect with Race Condition Handling
    useEffect(() => {
        let isCancelled = false;

        // Determine effective mode: Prop overrides store (though store is deprecated for this)
        const effectiveMode = overrideMode || 'discover';

        // LIBRARY MODE LOGIC
        if (effectiveMode !== 'discover') {
            const fetchLibrary = async () => {
                setIsLoading(true);
                setMovies([]); // Clear discover movies to avoid confusion

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
                    // Batch fetch details. Limit to 50 for now to avoid abuse.
                    // In real app, we'd have a backend endpoint for this.
                    const promises = idsToFetch.slice(0, 50).map(id => fetchMovieDetails(id).catch(() => null));
                    const results = await Promise.all(promises);

                    // Filter text content for keywords if needed? 
                    // For now just show all in list.
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
            // If page is 1, we rely on the Server Component to pass 'initialMovies'.
            // When filters change -> URL changes -> Server Re-renders -> new initialMovies passed.
            // Client fetch is ONLY for Pagination (Page > 1).

            if (page === 1) {
                // Do not fetch. The sync effect below handles initial data.
                // Just clear loading state if it was somehow stuck.
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                console.log(`Fetching page ${page}...`);

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
                    // Only append for Page > 1. 
                    addMovies(fetchedMovies);
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
    }, [page, selectedMoods, selectedLanguages, selectedKeywords, selectedYear, searchQuery, selectedRuntime, minRating, selectedWatchProviders, sortBy, watchedMovies, includeAdult, setMovies, addMovies, setIsLoading, mediaMode, watchlistMovies, likedMovies, overrideMode]);

    // KEY COMPONENT: Sync Initial Data when Prop Updates (Server Re-render)
    useEffect(() => {
        if (initialMovies && initialMovies.length > 0) {
            setMovies(initialMovies);
            setTotalResults(initialTotalResults || 0);
            setPage(1); // Ensure we are on page 1
            setIsLoading(false);
        }
    }, [initialMovies, initialTotalResults, setMovies, setTotalResults, setPage, setIsLoading]);


    // Stable Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting) {
                    // Check refs to avoid closure staleness
                    const isDiscover = (overrideMode || 'discover') === 'discover';
                    if (!isLoadingRef.current && isDiscover) {
                        console.log("Observer fired! Incrementing page from", pageRef.current);
                        setPage(pageRef.current + 1);
                    }
                }
            },
            { threshold: 0.1, rootMargin: '1000px' }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [setPage]); // Minimal dependencies

    // Disable infinite scroll for library views (until we implement pagination for library)
    useEffect(() => {
        if ((overrideMode || 'discover') !== 'discover' && observerTarget.current) {
            // observer.unobserve(observerTarget.current); 
            // Actually, simply hiding the sentinel or not incrementing page is enough.
            // Our intersection observer logic handles page increment.
            // We just need to ensure `setPage` doesn't trigger a 'discover' fetch if we are in 'library' mode.
            // But wait, the main useEffect handles `viewFilter !== discover` branch first.
            // So if `page` increments, the main effect runs, sees 'library', and re-fetches library?
            // Re-fetching library on scroll is redundant.
            // We should just return if viewFilter is not discover in the Observer callback.
        }
    }, [overrideMode]);

    // const handleCardClick = (id: number) => {
    //    const movie = movies.find(m => m.id === id);
    //    if (movie) setActiveMovie(movie);
    // };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 px-4 md:px-8 pb-20">
            {isLoading && page === 1 ? (
                Array.from({ length: 15 }).map((_, i) => <MovieSkeleton key={i} />)
            ) : (
                <>
                    {movies
                        .filter(movie => !hideWatched || !watchedMovies.includes(movie.id))
                        .map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                            // onClick={() => handleCardClick(movie.id)} <--- Removed to enable internal Link/Navigation
                            />
                        ))}

                    {!isLoading && movies.filter(movie => !hideWatched || !watchedMovies.includes(movie.id)).length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                            <h3 className="text-xl font-medium text-black mb-2">
                                {hideWatched ? "All results hidden (Watched)" : "No vibe match found"}
                            </h3>
                        </div>
                    )}
                </>
            )}

            {/* Always rendered sentinel */}
            <div ref={observerTarget} className="col-span-full h-20 w-full flex justify-center items-center opacity-0">
                Loading...
            </div>

            {/* Loading spinner for subsequent pages */}
            {isLoading && page > 1 && (
                <div className="col-span-full py-4 flex justify-center">
                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
