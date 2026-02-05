"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { MovieCard } from "./MovieCard";
import { useEffect, useRef, useCallback } from "react";
import { fetchMovies } from "@/lib/tmdb";

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
}

export function MovieGrid({ initialMovies = [] }: MovieGridProps) {
    const {
        movies, setMovies, addMovies,
        selectedMoods, selectedLanguages, selectedKeywords, selectedYear, searchQuery,
        // Advanced Filters
        selectedRuntime, minRating, selectedWatchProviders, sortBy,
        watchedMovies, setActiveMovie,
        isLoading, setIsLoading,
        page, setPage,
        includeAdult,
        mediaMode // Global switch
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
                const fetchedMovies = await fetchMovies({
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
                    const filtered = fetchedMovies.filter(m => !watchedMovies.includes(m.id));
                    addMovies(filtered); // Only append for Page > 1
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
    }, [page, selectedMoods, selectedLanguages, selectedKeywords, selectedYear, searchQuery, selectedRuntime, minRating, selectedWatchProviders, sortBy, watchedMovies, includeAdult, setMovies, addMovies, setIsLoading, mediaMode]);

    // KEY COMPONENT: Sync Initial Data when Prop Updates (Server Re-render)
    useEffect(() => {
        if (initialMovies) {
            // We set movies whenever initialMovies changes.
            // This handles the "Filter Change via URL" case.
            // We also setPage(1) implicitly via the store reset elsewhere? 
            // No, if URL changes, we are on a new "page view" effectively.
            setMovies(initialMovies);
            setPage(1); // Ensure we are on page 1
            setIsLoading(false);
        }
    }, [initialMovies, setMovies, setPage, setIsLoading]);


    // Stable Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const target = entries[0];
                if (target.isIntersecting) {
                    // Check refs to avoid closure staleness
                    if (!isLoadingRef.current) {
                        console.log("Observer fired! Incrementing page from", pageRef.current);
                        setPage(pageRef.current + 1);
                    }
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [setPage]); // Minimal dependencies

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
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                        // onClick={() => handleCardClick(movie.id)} <--- Removed to enable internal Link/Navigation
                        />
                    ))}

                    {!isLoading && movies.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                            <h3 className="text-xl font-medium text-black mb-2">No vibe match found</h3>
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
