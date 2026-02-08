import { FilterParams } from "./constants";

export interface SearchIntent {
    type: 'nav' | 'filter' | 'similar' | 'text' | 'person';
    query: string;
    params?: FilterParams;
    targetId?: number; // For 'similar' or 'person'
    confidence: number;
}

// Map of common genre names to IDs
const GENRE_MAP: Record<string, string> = {
    'action': '28',
    'adventure': '12',
    'animation': '16',
    'comedy': '35',
    'crime': '80',
    'documentary': '99',
    'drama': '18',
    'family': '10751',
    'fantasy': '14',
    'history': '36',
    'horror': '27',
    'music': '10402',
    'mystery': '9648',
    'romance': '10749',
    'scifi': '878',
    'sci-fi': '878',
    'science fiction': '878',
    'thriller': '53',
    'war': '10752',
    'western': '37',
    'kids': '10751',
    'funny': '35',
    'scary': '27',
    'love': '10749',
    'aliens': '878',
    'robots': '878',
};

export function parseSearchIntent(query: string): SearchIntent {
    const lower = query.toLowerCase().trim();

    // 1. "Movies like X" (Similar)
    // This is tricky because we need to know the ID of X. 
    // We'll return a 'text' intent but with a special 'trigger' flag or handled in UI?
    // Actually, best to handle "Movies like" by searching for X, getting first result ID, then fetching recommendations.
    // The UI or a second logic step needs to handle the async part. 
    // Here we just identify the pattern.
    if (lower.startsWith('movies like ') || lower.startsWith('similar to ') || lower.startsWith('shows like ')) {
        const targetName = lower.replace(/movies like |similar to |shows like /g, '').trim();
        return {
            type: 'similar',
            query: targetName,
            confidence: 0.9
        };
    }

    // 2. "90s Action", "2023 Horror" (Year + Genre)
    const yearRegex = /\b(19|20)\d{2}s?\b/;
    const yearMatch = lower.match(yearRegex);

    if (yearMatch) {
        let year = yearMatch[0];
        let isDecade = false;

        if (year.endsWith('s')) {
            year = year.slice(0, -1);
            isDecade = true; // Logic to handle decades (start/end dates) would be in params
        }

        // Find genre
        const words = lower.replace(yearMatch[0], '').split(' ');
        const genre = words.find(w => GENRE_MAP[w] || GENRE_MAP[w + 's']); // simple check

        if (genre) {
            const genreId = GENRE_MAP[genre] || GENRE_MAP[genre + 's'];
            const params: FilterParams = {
                moods: [], // Clear moods if specific genre requested
                languages: [],
                userKeywords: [],
                year: isDecade ? undefined : parseInt(year),
                // For decade, we'd need complex date logic in FilterParams which relies on single 'year' or explicit dates.
                // For now, let's just use exact year if not decade, or ignore decade logic in this simple V1.
                // Actually, let's treat decade as the start year roughly? Or just let the user see the year results.
            };

            // If decade, we might need a custom filter logic not fully supported by our simple 'year' param yet.
            // But 'primary_release_date.gte' support exists.

            return {
                type: 'filter',
                query: lower,
                params: {
                    ...params,
                    // We can't easily pass 'genre' ids directly to our current filter store setup 
                    // unless we add 'selectedGenres' to store. 
                    // But we DO have `moods`. We can try to map genre to mood?
                    // Better: The Store should support `with_genres` override or we map to closest Mood.
                    // For now, we'll return the Intent and let the UI decide how to apply it (e.g. set URL params directly).
                },
                confidence: 0.8
            };
        }
    }

    // Default
    return {
        type: 'text',
        query: lower,
        confidence: 0.1
    };
}
