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
    | 'cheerful' | 'dark' | 'inspiring' | 'intense' | 'Hentai' | 'better jaiga pele chole jabo';

// Mappings for Movie (standard) and TV (different IDs)
// TV IDs: ActionAdv(10759), SciFi(10765), WarPolitics(10768), Kids(10762)
export const MOOD_MAPPINGS: Record<Mood, { movie_genres?: string; tv_genres?: string; with_keywords?: string }> = {
    'chilled': {
        movie_genres: '35,10751',
        tv_genres: '35,10751,10762', // Comedy, Family, Kids
    },
    'adrenaline': {
        movie_genres: '28,12', // Action, Adventure
        tv_genres: '10759,10768', // Action&Adv, War&Politics
    },
    'mind-bending': {
        movie_genres: '878,9648,53', // Sci-Fi, Mystery, Thriller
        tv_genres: '10765,9648', // Sci-Fi & Fantasy, Mystery
    },
    'romantic': {
        movie_genres: '10749',
        tv_genres: '18,10766', // Drama, Soap
    },
    'cheerful': {
        movie_genres: '35,10402',
        tv_genres: '35,10764', // Comedy, Reality
    },
    'dark': {
        movie_genres: '27,80,53', // Horror, Crime, Thriller
        tv_genres: '80,9648', // Crime, Mystery
    },
    'inspiring': {
        movie_genres: '18,99',
        tv_genres: '18,99', // Drama, Documentary
    },
    'intense': {
        movie_genres: '53,28,10752', // Thriller, Action, War
        tv_genres: '10768,10759', // War, Action&Adv
    },
    'Hentai': {
        with_keywords: '155453,207317' // Anime/Hentai keywords effectively
    },
    'better jaiga pele chole jabo': {
        movie_genres: '12,14', // Adventure, Fantasy
        tv_genres: '10759,10765', // Action&Adv, Sci-Fi&Fantasy
    }
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
    images?: {
        profiles: { file_path: string; aspect_ratio: number }[];
    };
}

export interface CastCredit {
    id: number; // Movie ID
    title: string;
    poster_path: string;
    character: string;
    release_date: string;
    vote_average: number;
}
