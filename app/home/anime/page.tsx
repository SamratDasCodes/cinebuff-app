import { MovieGrid } from "@/components/MovieGrid";
import { fetchMovies } from "@/lib/tmdb";
import { parseSearchParams } from "@/lib/urlUtils";
import { ClientStateSync } from "@/components/ClientStateSync";

import { ResultCount } from "@/components/ResultCount";

export default async function AnimePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const filters = parseSearchParams(await searchParams);

    // Force mediaMode
    filters.mediaMode = 'anime';

    const { results: movies, totalResults } = await fetchMovies(filters);

    return (
        <main className="min-h-screen text-white pb-20">
            <ClientStateSync newParams={filters} />
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-200 to-rose-400">
                            Anime
                        </h1>
                        <ResultCount initialValue={totalResults} />
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Japanese animation and films</p>
                </div>
                <MovieGrid initialMovies={movies} initialTotalResults={totalResults} />
            </div>
        </main>
    );
}
