import { MovieGrid } from "@/components/MovieGrid";
import { fetchMovies } from "@/lib/tmdb";
import { parseSearchParams } from "@/lib/urlUtils";
import { ClientStateSync } from "@/components/ClientStateSync";

import { ResultCount } from "@/components/ResultCount";

import { cookies } from "next/headers";

export default async function ShowsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const filters = parseSearchParams(params);
    const cookieStore = await cookies();

    // Force mediaMode
    filters.mediaMode = 'tv';

    // Apply Defaults only if this is the default mode
    const defaultMode = cookieStore.get('default_media_mode')?.value || 'movie';
    const isDefaultMode = defaultMode === 'tv';

    if (isDefaultMode) {
        if (!filters.languages || filters.languages.length === 0) {
            const defaultLangs = cookieStore.get('default_languages')?.value;
            filters.languages = defaultLangs ? defaultLangs.split(',') : ['en', 'bn', 'hi'];
        }

        if (!params['sort_by']) {
            const defaultSort = cookieStore.get('default_sort_by')?.value;
            if (defaultSort) filters.sortBy = defaultSort;
        }
    }

    const { results: movies, totalResults } = await fetchMovies(filters);

    return (
        <main className="min-h-screen text-white pb-20">
            <ClientStateSync newParams={filters} />
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
