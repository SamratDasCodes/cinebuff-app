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
// Mappings for Movie (standard) and TV (different IDs)
// TV IDs: ActionAdv(10759), SciFi(10765), WarPolitics(10768), Kids(10762)
export const MOOD_MAPPINGS: Record<Mood, { movie_genres?: string; tv_genres?: string; with_keywords?: string }> = {
    'chilled': {
        movie_genres: '35,10751',
        tv_genres: '35,10751,10762', // Comedy, Family, Kids
        with_keywords: '209379,161184' // feel good, slice of life (ids approx)
    },
    'adrenaline': {
        movie_genres: '28,12',
        tv_genres: '10759,10768', // Action&Adv, War&Politics
        with_keywords: '9748,3096,220792' // revenge, superhero, intense
    },
    'mind-bending': {
        movie_genres: '878,9648',
        tv_genres: '10765,9648', // Sci-Fi & Fantasy, Mystery
        with_keywords: '14667,236729,170966' // psychological thriller, mind fuck, surrealism
    },
    'romantic': {
        movie_genres: '10749',
        tv_genres: '18,10766', // Drama, Soap (closest to romance focus)
        with_keywords: '9840,9963,160472' // romance, love, love triangle
    },
    'cheerful': {
        movie_genres: '35,10402',
        tv_genres: '35,10764', // Comedy, Reality
        with_keywords: '9714,166304' // sitcom, uplifting
    },
    'dark': {
        movie_genres: '27,80',
        tv_genres: '80,9648', // Crime, Mystery (Horror is often sparse in TV genre 27 check?)
        with_keywords: '12339,9718,17822' // dark comedy, serial killer, disturbing
    },
    'inspiring': {
        movie_genres: '18,99',
        tv_genres: '18,99', // Drama, Documentary
        with_keywords: '209379,1586,15555' // feel good, biography, sports
    },
    'intense': {
        movie_genres: '53,10752',
        tv_genres: '10768,10759', // War, Action
        with_keywords: '156096,9677,9663' // suspense, kidnapping, sequel
    },
    'Hentai': {
        with_keywords: '155453,207317' // Anime/Hentai keywords effectively
    },
    'better jaiga pele chole jabo': {
        movie_genres: '12,14,10751',
        tv_genres: '10759,10765',
        with_keywords: '4344,9921,173255' // travel, road trip, wanderlust
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
