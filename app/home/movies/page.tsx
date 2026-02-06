import { MovieGrid } from "@/components/MovieGrid";
import { fetchMovies } from "@/lib/tmdb";
import { parseSearchParams } from "@/lib/urlUtils";
import { ClientStateSync } from "@/components/ClientStateSync"; // We need this to sync raw params to store? Or Grid handles it?
// Grid handles "movies" state sync, but distinct filters (moods, etc.) need to be synced to store for UI consistency.
// We should create a helper component for that.

import { ResultCount } from "@/components/ResultCount";

export default async function MoviesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const filters = parseSearchParams(await searchParams);

    // Force mediaMode
    filters.mediaMode = 'movie';

    const { results: movies, totalResults } = await fetchMovies(filters);
    console.log("[MoviesPage] totalResults:", totalResults);

    return (
        <main className="min-h-screen text-white pb-20">
            {/* Sync URL Params to Store for UI Consistency (e.g. Filter Tray highlighting) */}
            <ClientStateSync newParams={filters} />

            <div className="max-w-7xl mx-auto">
                <div className="mb-6 px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400">
                            Movies
                        </h1>
                        <ResultCount initialValue={totalResults} />
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Discover cinematic masterpieces</p>
                </div>

                <MovieGrid initialMovies={movies} initialTotalResults={totalResults} />
            </div>
        </main>
    );
}
