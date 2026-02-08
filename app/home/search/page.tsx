import { MovieGrid } from "@/components/MovieGrid";
import { fetchMovies } from "@/lib/tmdb";
import { parseSearchParams } from "@/lib/urlUtils";
import { ClientStateSync } from "@/components/ClientStateSync";
import { Search } from "lucide-react";

import { ResultCount } from "@/components/ResultCount";

import { cookies } from "next/headers";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const filters = parseSearchParams(await searchParams);
    const query = filters.query;
    const cookieStore = await cookies();

    if (!query) {
        return (
            <main className="min-h-screen text-white pb-20 pt-8">
                <ClientStateSync newParams={filters} />
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                    <div className="bg-indigo-500/10 p-6 rounded-full mb-6">
                        <Search className="w-12 h-12 text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Search for Movies, TV Shows, or People</h2>
                    <p className="text-gray-500 max-w-md">
                        Type in the search bar above to find your favorite content.
                        We'll show you the best matches across all categories.
                    </p>
                </div>
            </main>
        );
    }

    // Apply Defaults for Search Results too
    if (!filters.languages || filters.languages.length === 0) {
        const defaultLangs = cookieStore.get('default_languages')?.value;
        filters.languages = defaultLangs ? defaultLangs.split(',') : ['en', 'bn', 'hi'];
    }

    const { results: movies, totalResults } = await fetchMovies(filters);

    return (
        <main className="min-h-screen text-white pb-20">
            <ClientStateSync newParams={filters} />
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 px-4 md:px-8 mt-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
                            Results for <span className="text-indigo-600">"{query}"</span>
                        </h1>
                        <ResultCount initialValue={totalResults} />
                    </div>
                </div>

                <MovieGrid initialMovies={movies} initialTotalResults={totalResults} />
            </div>
        </main>
    );
}
