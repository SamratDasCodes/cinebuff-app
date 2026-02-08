import { MovieGrid } from "@/components/MovieGrid";
import { fetchMovies } from "@/lib/tmdb";
import { parseSearchParams } from "@/lib/urlUtils";
import { ClientStateSync } from "@/components/ClientStateSync";

import { ResultCount } from "@/components/ResultCount";

import { cookies } from "next/headers";

export default async function ShowsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const rawFilters = parseSearchParams(await searchParams);
    const effectiveFilters = { ...rawFilters };
    const cookieStore = await cookies();

    // Force mediaMode
    effectiveFilters.mediaMode = 'tv';
    rawFilters.mediaMode = 'tv';

    // Apply Defaults
    if (!effectiveFilters.languages || effectiveFilters.languages.length === 0) {
        const defaultLangs = cookieStore.get('default_languages')?.value;
        effectiveFilters.languages = defaultLangs ? defaultLangs.split(',') : ['en', 'bn', 'hi'];
    }

    if (!effectiveFilters.sortBy && !searchParams['sort_by']) {
        const defaultSort = cookieStore.get('default_sort_by')?.value;
        if (defaultSort) effectiveFilters.sortBy = defaultSort;
    }

    const { results: movies, totalResults } = await fetchMovies(effectiveFilters);

    return (
        <main className="min-h-screen text-white pb-20">
            <ClientStateSync newParams={rawFilters} />
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 px-4 md:px-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-purple-400">
                            TV Shows
                        </h1>
                        <ResultCount initialValue={totalResults} />
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Binge-worthy series and episodes</p>
                </div>
                <MovieGrid initialMovies={movies} initialTotalResults={totalResults} />
            </div>
        </main>
    );
}
