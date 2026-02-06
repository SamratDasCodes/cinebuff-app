"use server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

import { MOOD_MAPPINGS, type Mood, type FilterParams, type Movie, type Person, type CastCredit } from "./constants";

// Helper to search for keyword IDs
export async function searchKeywords(query: string) {
    if (!TMDB_API_KEY || !query) return [];
    try {
        const res = await fetch(`${BASE_URL}/search/keyword?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.results as { id: number, name: string }[];
    } catch (e) {
        return [];
    }
}

// Helper to get keyword name by ID
export async function fetchKeywordDetails(id: number) {
    if (!TMDB_API_KEY) return null;
    try {
        const res = await fetch(`${BASE_URL}/keyword/${id}?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 * 24 } });
        if (!res.ok) return null;
        const data = await res.json();
        return data as { id: number, name: string };
    } catch (e) {
        return null;
    }
}

// Helper to normalize TV/Movie/Anime results to common Movie interface
function normalizeMedia(result: any, mediaType: 'movie' | 'tv'): Movie {
    return {
        id: result.id,
        title: result.title || result.name, // TV shows use 'name'
        poster_path: result.poster_path,
        backdrop_path: result.backdrop_path,
        overview: result.overview,
        release_date: result.release_date || result.first_air_date, // TV uses 'first_air_date'
        vote_average: result.vote_average,
        genre_ids: result.genre_ids,
        adult: result.adult,
        original_language: result.original_language,
        media_type: mediaType,
        name: result.name, // Preserve distinct name for TV detection
    };
}

export async function fetchMovies({ moods, languages, userKeywords, year, query, includeAdult = false, page = 1, runtime = 'all', minRating = 0, watchProviders = [], sortBy = 'primary_release_date.desc', mediaMode = 'movie' }: FilterParams & { query?: string, mediaMode?: 'movie' | 'tv' | 'anime' }) {
    if (!TMDB_API_KEY) {
        console.error("TMDB_API_KEY is missing");
        return { results: [], totalResults: 0 };
    }

    console.log(`Fetching ${mediaMode} - Page: ${page}, Query: "${query || ''}", Moods: ${moods}`);

    try {
        const fetchCommon = async (endpoint: string, extraParams: URLSearchParams = new URLSearchParams()) => {
            // Sanitize sort_by for TV
            let effectiveSortBy = sortBy;
            if (endpoint.includes('tv') && sortBy.includes('primary_release_date')) {
                effectiveSortBy = sortBy.replace('primary_release_date', 'first_air_date');
            } else if (!endpoint.includes('tv') && sortBy.includes('first_air_date')) {
                effectiveSortBy = sortBy.replace('first_air_date', 'primary_release_date');
            }

            const params = new URLSearchParams({
                api_key: TMDB_API_KEY,
                page: page.toString(),
                include_adult: includeAdult ? 'true' : 'false',
                language: 'en-US',
                sort_by: effectiveSortBy,
                ...Object.fromEntries(extraParams)
            });

            // Common Filters
            if (minRating > 0) {
                params.append('vote_average.gte', minRating.toString());
                params.append('vote_count.gte', '100');
            }
            if (watchProviders.length > 0) {
                params.append('with_watch_providers', watchProviders.join('|'));
                params.append('watch_region', 'IN');
            }

            // Runtime (Approximate for TV as episode runtime)
            if (runtime === 'short') params.append('with_runtime.lte', '90');
            else if (runtime === 'medium') { params.append('with_runtime.gte', '90'); params.append('with_runtime.lte', '120'); }
            else if (runtime === 'long') params.append('with_runtime.gte', '120');

            // Moods/Keywords Logic
            const allGenres = new Set<string>();
            const allKeywords = new Set<string>();
            let forceAdult = false;
            let isHentaiMode = false;

            if (userKeywords) userKeywords.forEach(k => allKeywords.add(k));

            moods.forEach(mood => {
                const config = MOOD_MAPPINGS[mood];
                if (mood === 'Hentai') {
                    forceAdult = true;
                    isHentaiMode = true;
                }

                // Determine which genres to use based on endpoint type
                const isTvEndpoint = endpoint.includes('tv');
                const genresStr = isTvEndpoint ? config.tv_genres : config.movie_genres;

                if (genresStr) genresStr.split(',').forEach(g => allGenres.add(g));
                if (config.with_keywords) config.with_keywords.split(',').forEach(k => allKeywords.add(k));
            });

            const effectiveIncludeAdult = includeAdult || forceAdult;

            // For Anime: Enforce Animation Genre + Japanese Language
            if (mediaMode === 'anime') {
                allGenres.add('16'); // Animation
                params.append('with_original_language', 'ja');
            } else {
                if (languages && languages.length > 0) params.append('with_original_language', languages.join('|'));
            }

            if (forceAdult) {
                params.set('include_adult', 'true');
            }

            if (allGenres.size > 0) params.append('with_genres', Array.from(allGenres).join('|'));
            if (allKeywords.size > 0) params.append('with_keywords', Array.from(allKeywords).join(','));

            // Date Logic (Upcoming vs Released)
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            if (year === 'upcoming') {
                // Upcoming: From Tomorrow onwards
                if (endpoint.includes('tv')) {
                    params.append('first_air_date.gte', tomorrowStr);
                    // Force Sort Ascending for Upcoming if not specified otherwise
                    if (sortBy === 'primary_release_date.desc' || sortBy === 'popularity.desc') {
                        params.set('sort_by', 'first_air_date.asc');
                    }
                } else {
                    params.append('primary_release_date.gte', tomorrowStr);
                    params.append('release_date.gte', tomorrowStr);
                    // Force Sort Ascending for Upcoming
                    if (sortBy === 'primary_release_date.desc' || sortBy === 'popularity.desc') {
                        params.set('sort_by', 'primary_release_date.asc');
                    }
                }
            } else {
                // Standard: Released (Up to Today)
                // MODIFICATION: If a specific year is requested, we show ALL movies for that year (Released + Upcoming).
                // We only apply the "released up to today" constraint if NO year is specified (General Discover).

                if (year) {
                    params.append('primary_release_year', year.toString());
                    // For TV:
                    if (endpoint.includes('tv')) {
                        params.append('first_air_date_year', year.toString());
                    }
                } else {
                    // No year specified: Filter to only released content
                    if (endpoint.includes('tv')) {
                        params.append('first_air_date.lte', todayStr);
                    } else {
                        params.append('primary_release_date.lte', todayStr);
                        params.append('release_date.lte', todayStr);
                    }
                }
            }

            // Handle Search Query vs Discover
            let url = '';

            // Hentai Strategy: Force Search Query 'hentai'
            if (isHentaiMode) {
                const searchEndpoint = endpoint.includes('tv') ? 'search/tv' : 'search/movie';
                url = `${BASE_URL}/${searchEndpoint}`;
                params.delete('sort_by');
                params.set('query', 'hentai ' + (query || ''));
                if (year) params.append('primary_release_year', year.toString());
            }
            else if (query && query.trim().length > 0) {
                // Search doesn't support as many filters, simpler fallback
                const searchEndpoint = endpoint.includes('tv') ? 'search/tv' : 'search/movie';
                url = `${BASE_URL}/${searchEndpoint}`;
                params.delete('sort_by'); // Search is relevant sorted usually
                params.append('query', query);
                if (year) params.append('primary_release_year', year.toString());
            } else {
                url = `${BASE_URL}/${endpoint}`;
            }

            const fullUrl = `${url}?${params.toString()}`;
            // console.log("Fetching:", fullUrl); // Debug log (can be verbose)

            try {
                const res = await fetch(fullUrl, { next: { revalidate: 3600 } });
                if (!res.ok) {
                    const errorBody = await res.text(); // Get detailed error from TMDB
                    console.error(`[TMDB Error] Status: ${res.status} ${res.statusText}`);
                    console.error(`[TMDB Error] Body: ${errorBody}`);
                    throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
                }
                return await res.json();
            } catch (innerError) {
                console.error(`[TMDB Fetch Error] URL: ${fullUrl}`);
                console.error(`[TMDB Fetch Error] Cause:`, innerError);
                throw innerError; // Rethrow to be caught by outer block or handled
            }
        };

        // --- EXECUTION STRATEGIES ---

        let results: Movie[] = [];
        let totalResults = 0;

        if (mediaMode === 'anime') {
            const [moviesData, tvData] = await Promise.all([
                fetchCommon('discover/movie'),
                fetchCommon('discover/tv')
            ]);
            const normalizedMovies = (moviesData.results || []).map((m: any) => normalizeMedia(m, 'movie'));
            const normalizedTV = (tvData.results || []).map((t: any) => normalizeMedia(t, 'tv'));
            results = [...normalizedMovies, ...normalizedTV];
            totalResults = (moviesData.total_results || 0) + (tvData.total_results || 0);

        } else if (mediaMode === 'tv') {
            const data = await fetchCommon('discover/tv');
            results = (data.results || []).map((t: any) => normalizeMedia(t, 'tv'));
            totalResults = data.total_results || 0;

        } else {
            const data = await fetchCommon('discover/movie');
            results = (data.results || []).map((m: any) => normalizeMedia(m, 'movie'));
            totalResults = data.total_results || 0;
        }

        if (sortBy.includes('popularity')) {
            results.sort((a, b) => b.vote_average - a.vote_average);
        }

        return { results, totalResults };

    } catch (error) {
        console.error(error);
        return { results: [], totalResults: 0 };
    }
}

export async function fetchMovieDetails(id: number, forceType?: 'movie' | 'tv') {
    if (!TMDB_API_KEY) {
        console.error("TMDB Error: API Key missing on server");
        return null;
    }

    // console.log(`[TMDB] Fetching Details for ID: ${id} (Force: ${forceType})`);

    // Smart Fetch: Try Movie first, then TV
    const smartFetch = async (type: 'movie' | 'tv') => {
        const appends = type === 'movie'
            ? 'videos,credits,watch/providers,release_dates'
            : 'videos,credits,watch/providers,content_ratings';

        const url = `${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&append_to_response=${appends}`;

        try {
            const res = await fetch(url, { next: { revalidate: 3600 } });
            if (!res.ok) {
                // If forced, we truly failed. If smart, we just warn and return null to try next.
                // console.warn(`[TMDB] ${type} fetch failed for ID ${id}: Status ${res.status}`);
                return null;
            }
            const data = await res.json();
            return { ...data, media_type: type }; // Attach type!
        } catch (e) {
            console.warn(`[TMDB] FETCH WARNING for ${type}/${id} (likely network or 404):`, (e as Error).message);
            return null;
        }
    };

    if (forceType) {
        return await smartFetch(forceType);
    }

    let data = await smartFetch('movie');
    if (!data) {
        // console.log(`[TMDB] ID ${id} not found as movie, trying TV...`);
        data = await smartFetch('tv');
    }

    if (!data) {
        console.warn(`[TMDB] Details not found for ID ${id} (checked Movie & TV)`);
        return null;
    }

    return data;
}
// Multi-Search Types
export interface MultiSearchResult {
    id: number;
    media_type: 'movie' | 'person' | 'keyword' | 'tv';
    title?: string; // For movies
    name?: string; // For people/keywords
    poster_path?: string; // For movies
    profile_path?: string; // For people
    release_date?: string;
    vote_average?: number;
    genre_ids?: number[]; // For movies
    adult?: boolean;
}

export async function searchMulti(query: string, includeAdult: boolean = false): Promise<MultiSearchResult[]> {
    if (!TMDB_API_KEY || !query) return [];
    try {
        const url = `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=${includeAdult}`;
        const res = await fetch(url, { next: { revalidate: 3600 } });

        if (!res.ok) return [];

        const data = await res.json();

        // Filter mainly for known types and clean up
        return (data.results as any[]).filter(item =>
            item.media_type === 'movie' ||
            item.media_type === 'person' ||
            // TMDB multi-search generally returns movie, tv, person. 
            // Keywords are usually in a separate endpoint, but let's see if we can shim them or if we need a separate call.
            // Actually, for a true "Omnisearch", we might want to parallel fetch keywords if multi doesn't return them.
            // But let's stick to TMDB standard multi structure for now.
            item.media_type === 'tv'
        ).map(item => ({
            id: item.id,
            media_type: item.media_type,
            title: item.title,
            name: item.name,
            poster_path: item.poster_path,
            profile_path: item.profile_path,
            release_date: item.release_date || item.first_air_date,
            vote_average: item.vote_average,
            genre_ids: item.genre_ids,
            adult: item.adult
        }));

    } catch (e) {
        console.error("Multi Search Error:", e);
        return [];
    }
}

export async function fetchMovieRecommendations(id: number, page: number = 1, mediaType: 'movie' | 'tv' = 'movie') {
    if (!TMDB_API_KEY || !id || isNaN(id)) return [];
    try {
        // Recommendations are better than 'similar' as they use TMDB's algorithm
        const url = `${BASE_URL}/${mediaType}/${id}/recommendations?api_key=${TMDB_API_KEY}&page=${page}`;
        const res = await fetch(url, { next: { revalidate: 3600 } });

        if (!res.ok) {
            // Fallback to 'similar' if recommendations fail (e.g. 404)
            if (res.status === 404) {
                console.warn(`Recommendations not found for ${id} (${mediaType}), trying similar...`);
                const similarUrl = `${BASE_URL}/${mediaType}/${id}/similar?api_key=${TMDB_API_KEY}&page=${page}`;
                const similarRes = await fetch(similarUrl, { next: { revalidate: 3600 } });
                if (!similarRes.ok) return [];
                const similarData = await similarRes.json();
                return (similarData.results as any[]).map(r => normalizeMedia(r, mediaType));
            }
            return [];
        }

        const data = await res.json();
        return (data.results as any[]).map(r => normalizeMedia(r, mediaType));
    } catch (error) {
        // Use warn instead of error to avoid Next.js overlay in dev for non-critical data
        console.warn("Fetch Recommendations Warning:", error);
        return [];
    }
}
// Person Types imported from constants

export async function fetchPersonDetails(id: number) {
    if (!TMDB_API_KEY || isNaN(id)) return null;
    try {
        const res = await fetch(`${BASE_URL}/person/${id}?api_key=${TMDB_API_KEY}&append_to_response=images`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        return await res.json() as Person;
    } catch (e) {
        console.warn("Person Details Error:", e);
        return null; // Gracefully fail
    }
}

export async function fetchPersonMovieCredits(id: number) {
    if (!TMDB_API_KEY || isNaN(id)) return [];
    try {
        const res = await fetch(`${BASE_URL}/person/${id}/movie_credits?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        const cast = data.cast as CastCredit[];
        // Sort by release date desc (newest first)
        return cast.sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime());
    } catch (e) {
        console.warn("Person Credits Error:", e);
        return [];
    }
}

export async function fetchTvSeason(tvId: number, seasonNumber: number) {
    if (!TMDB_API_KEY) return null;
    try {
        const res = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.warn("Fetch TV Season Error:", e);
        return null; // Gracefully fail
    }
}
