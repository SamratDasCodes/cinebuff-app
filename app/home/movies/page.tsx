import { MovieGrid } from "@/components/MovieGrid";
import { fetchMovies } from "@/lib/tmdb";
import { parseSearchParams } from "@/lib/urlUtils";
import { ClientStateSync } from "@/components/ClientStateSync"; // We need this to sync raw params to store? Or Grid handles it?
// Grid handles "movies" state sync, but distinct filters (moods, etc.) need to be synced to store for UI consistency.
// We should create a helper component for that.

import { ResultCount } from "@/components/ResultCount";
import { StorePagination } from "@/components/StorePagination";
import { cookies } from "next/headers"; // Import cookies

export default async function MoviesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const filters = parseSearchParams(params);
    const cookieStore = await cookies(); // Read cookies

    // Force mediaMode
    filters.mediaMode = 'movie';

    // Apply Defaults if not present (Matches Store defaults) AND if this is the user's default mode
    const defaultMode = cookieStore.get('default_media_mode')?.value || 'movie';
    const isDefaultMode = defaultMode === 'movie';

    if (isDefaultMode) {
        if (!filters.languages || filters.languages.length === 0) {
            const defaultLangs = cookieStore.get('default_languages')?.value;
            filters.languages = defaultLangs ? defaultLangs.split(',') : ['en', 'bn', 'hi'];
        }

        if (!params['sort_by']) { // Check raw param only
            const defaultSort = cookieStore.get('default_sort_by')?.value;
            if (defaultSort) filters.sortBy = defaultSort;
        }
    }

    const { results: movies, totalResults } = await fetchMovies(filters);
    console.log("[MoviesPage] totalResults:", totalResults);

    return (
        <main className="min-h-screen text-white pb-20">
            {/* Sync URL Params to Store for UI Consistency (e.g. Filter Tray highlighting) */}
            <ClientStateSync newParams={filters} />

            <div className="max-w-7xl mx-auto">
                <div className="mb-6 px-4 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <div className="flex items-center justify-center md:justify-start gap-4 w-full md:w-auto">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-indigo-400">
                                Movies
                            </h1>
                            <ResultCount initialValue={totalResults} />
                        </div>
                        <div className="flex-1 hidden md:block" />
                        <div className="w-full md:w-auto flex justify-center md:justify-end">
                            <StorePagination initialTotalResults={totalResults} />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Discover cinematic masterpieces</p>
                </div>

                <MovieGrid initialMovies={movies} initialTotalResults={totalResults} />
            </div>
        </main>
    );
}
