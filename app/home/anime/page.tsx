import { MovieGrid } from "@/components/MovieGrid";
import { fetchMovies } from "@/lib/tmdb";
import { parseSearchParams } from "@/lib/urlUtils";
import { ClientStateSync } from "@/components/ClientStateSync";

import { ResultCount } from "@/components/ResultCount";
import { StorePagination } from "@/components/StorePagination";
import { cookies } from "next/headers";

export default async function AnimePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const filters = parseSearchParams(params);
    const cookieStore = await cookies();

    // Force mediaMode
    filters.mediaMode = 'anime';

    // Apply Defaults
    // Anime: No default language filter as per request.

    // Anime: No default language or sort filters to apply from user preferences.

    const { results: movies, totalResults } = await fetchMovies(filters);

    return (
        <main className="min-h-screen text-white pb-20">
            <ClientStateSync newParams={filters} />
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 px-4 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                        <div className="flex items-center justify-center md:justify-start gap-4 w-full md:w-auto">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-200 to-rose-400">
                                Anime
                            </h1>
                            <ResultCount initialValue={totalResults} />
                        </div>
                        <div className="flex-1 hidden md:block" />
                        <div className="w-full md:w-auto flex justify-center md:justify-end">
                            <StorePagination initialTotalResults={totalResults} />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Japanese animation and films</p>
                </div>
                <MovieGrid initialMovies={movies} initialTotalResults={totalResults} />
            </div>
        </main>
    );
}
