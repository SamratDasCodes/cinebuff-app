export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    release_date: string;
    vote_average: number;
    genre_ids: number[];
    adult?: boolean;
    media_type?: 'movie' | 'tv' | 'anime';
    original_language: string;
    name?: string; // For TV Shows
}

export type Mood =
    | 'chilled' | 'adrenaline' | 'mind-bending' | 'romantic'
    | 'cheerful' | 'dark' | 'inspiring' | 'intense' | 'Hentai';

// Mappings for Movie (standard) and TV (different IDs)
// TV IDs: ActionAdv(10759), SciFi(10765), WarPolitics(10768), Kids(10762)
export const MOOD_MAPPINGS: Record<Mood, { movie_genres?: string; tv_genres?: string; with_keywords?: string }> = {
    'chilled': { movie_genres: '35,10751', tv_genres: '35,10751' }, // Comedy, Family
    'adrenaline': { movie_genres: '28,12', tv_genres: '10759' }, // Action, Adventure -> TV Action&Adv
    'mind-bending': { movie_genres: '878,9648', tv_genres: '10765,9648' }, // Sci-Fi, Mystery
    'romantic': { movie_genres: '10749', tv_genres: '18' }, // Romance -> TV Drama
    'cheerful': { movie_genres: '35,10402', tv_genres: '35,10764' }, // Comedy, Music -> TV Comedy, Reality
    'dark': { movie_genres: '27,80', tv_genres: '80,9648' }, // Horror, Crime -> TV Crime, Mystery
    'inspiring': { movie_genres: '18', tv_genres: '18' }, // Drama
    'intense': { movie_genres: '53,10752', tv_genres: '10768,10759' }, // Thriller, War -> TV War&Politics, Action&Adv
    'Hentai': {} // Handled via query
};

export interface FilterParams {
    moods: Mood[];
    languages: string[];
    userKeywords: string[]; // IDs as strings
    year?: number | string | null;
    page?: number;
    query?: string;
    includeAdult?: boolean;
    // New Params
    runtime?: 'all' | 'short' | 'medium' | 'long';
    minRating?: number;
    watchProviders?: string[];
    sortBy?: string;
    mediaMode?: 'movie' | 'tv' | 'anime';
}

export interface Person {
    id: number;
    name: string;
    biography: string;
    birthday: string;
    place_of_birth: string;
    profile_path: string;
    known_for_department: string;
}

export interface CastCredit {
    id: number; // Movie ID
    title: string;
    poster_path: string;
    character: string;
    release_date: string;
    vote_average: number;
}
