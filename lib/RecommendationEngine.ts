"use server";

import { fetchMovieDetails, fetchMovies } from "./tmdb";
import { Movie } from "./constants";

// Weighting Constants
const WEIGHTS = {
    FAVORITE: 3,
    WATCHLIST: 2,
    WATCHED: 1,
    DISLIKED: -5 // Placeholder for future
};

interface UserInterestProfile {
    genres: Record<number, number>; // GenreID -> Score
    keywords: Record<number, number>; // KeywordID -> Score
    languages: Record<string, number>; // LanguageCode -> Score
    processedIds: Set<number>; // To avoid reprocessing
}

// 1. Metadata Aggregation
async function buildUserInterestProfile(
    likedIds: number[],
    watchlistIds: number[],
    watchedIds: number[],
    dislikedIds: number[]
): Promise<UserInterestProfile> {
    const profile: UserInterestProfile = {
        genres: {},
        keywords: {},
        languages: {},
        processedIds: new Set()
    };

    // Helper to process a list with a specific weight
    const processList = async (ids: number[], weight: number, limit: number = 10) => {
        // Take the most recent items (assuming ids are appended, so reverse or slice from end)
        // Actually, the store appends new items to the end, so we slice from the end.
        const recentIds = ids.slice(-limit);

        // Fetch metadata in parallel
        const promises = recentIds.map(async (id) => {
            if (profile.processedIds.has(id)) return;
            profile.processedIds.add(id);

            // We need details to get genres/keywords. 
            // fetchMovieDetails returns full object with genres.
            const details = await fetchMovieDetails(id, 'movie');
            if (!details) return;

            // Score Genres
            details.genres?.forEach((g: any) => {
                profile.genres[g.id] = (profile.genres[g.id] || 0) + weight;
            });

            // Score Languages
            if (details.original_language) {
                profile.languages[details.original_language] = (profile.languages[details.original_language] || 0) + weight;
            }

            // Score Keywords (if available in details, fetchMovieDetails appends distinct 'keywords' usually? 
            // Wait, fetchMovieDetails appends `keywords` in `append_to_response`? 
            // Looking at tmdb.ts, it appends 'videos,credits,watch/providers,release_dates'. 
            // It does NOT append keywords. We might need to fetch keywords separately or update fetchMovieDetails.
            // For now, let's assume we can get them or we might skip keywords if too expensive.
            // Actually, `keywords` is a standard append. 
            // Let's assume for V1 we stick to Genres to avoid 10 extra API calls, OR update tmdb.ts to include keywords.
            // *Self-correction*: I should update tmdb.ts to fetch keywords if I want this to work well.
            // But for now, let's rely on Genres which are always present.
        });

        await Promise.all(promises);
    };

    // Process lists concurrently
    await Promise.all([
        processList(likedIds, WEIGHTS.FAVORITE),
        processList(watchlistIds, WEIGHTS.WATCHLIST),
        processList(watchedIds, WEIGHTS.WATCHED),
        processList(dislikedIds, WEIGHTS.DISLIKED)
    ]);

    return profile;
}

// 2. Discovery Algorithm
export async function generatePersonalizedFeed(
    likedIds: number[],
    watchlistIds: number[],
    watchedIds: number[],
    dislikedIds: number[] = []
): Promise<Movie[]> {
    // A. Build Profile
    const profile = await buildUserInterestProfile(likedIds, watchlistIds, watchedIds, dislikedIds);

    // B. Extract Top Genres
    // Sort genres by score desc
    const topGenres = Object.entries(profile.genres)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 3) // Top 3
        .map(([id]) => id);

    // C. Extract Top Languages
    const topLanguages = Object.entries(profile.languages)
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 2) // Top 2
        .map(([lang]) => lang);

    if (topGenres.length === 0) {
        // Cold Start: Return Trending if no data
        const { fetchTrending } = await import("./tmdb");
        return (await fetchTrending('week')) as unknown as Movie[];
    }

    // D. Fetch Recommendations (Discovery)
    return await fetchDiscovery(topGenres, topLanguages, [...watchedIds, ...dislikedIds]);

}

// Dedicated Discovery Fetcher for Recommendations
async function fetchDiscovery(genreIds: string[], languageCodes: string[], excludeIds: number[]) {
    const TMDB_API_KEY = process.env.TMDB_API_KEY!;
    const BASE_URL = 'https://api.themoviedb.org/3';

    // Construct Query
    const params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        sort_by: 'popularity.desc',
        include_adult: 'false',
        include_video: 'false',
        page: '1',
        with_genres: genreIds.join('|'), // OR logic for broader results? or AND? Pipe is OR. Comma is AND.
        // Let's use OR (pipe) to get more results. 
        // Actually for "Personalized", maybe AND for the top 2? 
        // Let's stick to pipe (OR) for top 3 to ensure we get results.
    });

    if (languageCodes.length > 0) {
        // TMDB allows pipe for OR logic in with_original_language
        params.append('with_original_language', languageCodes.join('|'));
    }

    try {
        const res = await fetch(`${BASE_URL}/discover/movie?${params.toString()}`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();

        let movies = (data.results as any[]).map(r => ({
            id: r.id,
            title: r.title,
            poster_path: r.poster_path,
            backdrop_path: r.backdrop_path,
            overview: r.overview,
            release_date: r.release_date,
            vote_average: r.vote_average,
            genre_ids: r.genre_ids,
            adult: r.adult,
            original_language: r.original_language,
            media_type: 'movie'
        } as Movie));

        // Filter Excluded
        const excludeSet = new Set(excludeIds);
        movies = movies.filter(m => !excludeSet.has(m.id));

        return movies;

    } catch (e) {
        console.warn("Recommendation Fetch Error:", e);
        return [];
    }
}
