import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchMovies } from '@/lib/tmdb';
import { type Mood, type Movie, type Person } from '@/lib/constants';

interface MovieState {
    movies: Movie[];
    setMovies: (movies: Movie[]) => void;

    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    selectedMoods: Mood[];
    toggleMood: (mood: Mood) => void;

    selectedLanguages: string[];
    toggleLanguage: (lang: string) => void;

    selectedYear: number | string | null;
    setSelectedYear: (year: number | string | null) => void;

    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // New: Keywords
    selectedKeywords: { id: number, name: string }[];
    addKeyword: (keyword: { id: number, name: string }) => void;
    removeKeyword: (id: number) => void;

    watchedMovies: number[];
    toggleWatched: (id: number) => void;

    hideWatched: boolean;
    toggleHideWatched: () => void;

    likedMovies: number[];
    toggleLike: (id: number) => void;

    dislikedMovies: number[];
    toggleDislike: (id: number) => void;

    watchlistMovies: number[];
    toggleWatchlist: (id: number) => void;

    sensitiveMode: boolean;
    toggleSensitiveMode: () => void;

    includeAdult: boolean;
    toggleIncludeAdult: () => void;

    // Advanced Filters
    selectedRuntime: 'all' | 'short' | 'medium' | 'long';
    setRuntime: (runtime: 'all' | 'short' | 'medium' | 'long') => void;

    minRating: number;
    setMinRating: (rating: number) => void;

    selectedWatchProviders: string[];
    toggleWatchProvider: (providerId: string) => void;

    sortBy: string;
    setSortBy: (sort: string) => void;

    activeMovie: Movie | null;
    setActiveMovie: (movie: Movie | null) => void;

    // Pagination
    page: number;
    setPage: (page: number) => void;
    addMovies: (movies: Movie[]) => void;

    totalResults: number;
    setTotalResults: (total: number) => void;

    resetFilters: () => void;

    // Global Media Mode
    mediaMode: 'movie' | 'tv' | 'anime';
    setMediaMode: (mode: 'movie' | 'tv' | 'anime') => void;

    viewFilter: 'discover' | 'watchlist' | 'favorites';
    setViewFilter: (filter: 'discover' | 'watchlist' | 'favorites') => void;

    activePerson: Person | null;
    setActivePerson: (person: Person | null) => void;

    // User Identity & Tracking
    user: any | null; // Firebase User
    setUser: (user: any | null) => void;

    // Legacy/Guest tracking
    userId: string;
    userName: string;
    setUserName: (name: string) => void;

    cookieConsent: boolean | null; // null = not asked yet
    setCookieConsent: (consent: boolean) => void;

    searchHistory: string[];
    addToSearchHistory: (query: string) => void;

    clickHistory: { id: number, type: 'movie' | 'tv' | 'person', timestamp: number }[];
    addToClickHistory: (id: number, type: 'movie' | 'tv' | 'person') => void;

    // Preferences
    defaultMediaMode: 'movie' | 'tv' | 'anime';
    setDefaultMediaMode: (mode: 'movie' | 'tv' | 'anime') => void;

    defaultSortBy: string;
    setDefaultSortBy: (sort: string) => void;

    defaultLanguages: string[];
    setDefaultLanguages: (langs: string[]) => void;

    // Sync Status
    syncStatus: 'idle' | 'syncing' | 'saved' | 'error';
    setSyncStatus: (status: 'idle' | 'syncing' | 'saved' | 'error') => void;
}

export const useMovieStore = create<MovieState>()(
    persist(
        (set, get) => ({
            movies: [],
            setMovies: (movies) => set({ movies }),

            isLoading: false,
            setIsLoading: (isLoading) => set({ isLoading }),

            selectedMoods: [],
            toggleMood: (mood) => set((state) => {
                const isSelected = state.selectedMoods.includes(mood);
                return {
                    selectedMoods: isSelected
                        ? state.selectedMoods.filter(m => m !== mood)
                        : [...state.selectedMoods, mood]
                };
            }),

            selectedLanguages: ['en', 'bn', 'hi'],
            toggleLanguage: (lang) => set((state) => {
                const isSelected = state.selectedLanguages.includes(lang);
                return {
                    selectedLanguages: isSelected
                        ? state.selectedLanguages.filter(l => l !== lang)
                        : [...state.selectedLanguages, lang]
                };
            }),

            selectedYear: null,
            setSelectedYear: (year) => set({ selectedYear: year }),

            searchQuery: "",
            setSearchQuery: (query) => set({ searchQuery: query }),

            selectedKeywords: [],
            addKeyword: (keyword) => set((state) => ({
                selectedKeywords: [...state.selectedKeywords.filter(k => k.id !== keyword.id), keyword]
            })),
            removeKeyword: (id) => set((state) => ({
                selectedKeywords: state.selectedKeywords.filter(k => k.id !== id)
            })),

            watchedMovies: [],
            toggleWatched: (id) => set((state) => {
                const isWatched = state.watchedMovies.includes(id);
                return {
                    watchedMovies: isWatched
                        ? state.watchedMovies.filter(m => m !== id)
                        : [...state.watchedMovies, id]
                };
            }),

            hideWatched: false,
            toggleHideWatched: () => set((state) => ({ hideWatched: !state.hideWatched })),

            likedMovies: [],
            toggleLike: (id) => set((state) => {
                const isLiked = state.likedMovies.includes(id);
                // If liking, remove from dislike if present
                const newDisliked = isLiked ? state.dislikedMovies : state.dislikedMovies.filter(m => m !== id);
                return {
                    likedMovies: isLiked
                        ? state.likedMovies.filter(m => m !== id)
                        : [...state.likedMovies, id],
                    dislikedMovies: newDisliked
                };
            }),

            dislikedMovies: [],
            toggleDislike: (id) => set((state) => {
                const isDisliked = state.dislikedMovies.includes(id);
                // If disliking, remove from like if present
                const newLiked = isDisliked ? state.likedMovies : state.likedMovies.filter(m => m !== id);
                return {
                    dislikedMovies: isDisliked
                        ? state.dislikedMovies.filter(m => m !== id)
                        : [...state.dislikedMovies, id],
                    likedMovies: newLiked
                };
            }),

            watchlistMovies: [],
            toggleWatchlist: (id) => set((state) => {
                const isWatchlisted = state.watchlistMovies.includes(id);
                return {
                    watchlistMovies: isWatchlisted
                        ? state.watchlistMovies.filter(m => m !== id)
                        : [...state.watchlistMovies, id]
                };
            }),

            sensitiveMode: false,
            toggleSensitiveMode: () => set((state) => ({ sensitiveMode: !state.sensitiveMode })),

            includeAdult: false,
            toggleIncludeAdult: () => set((state) => ({ includeAdult: !state.includeAdult })),

            activeMovie: null,
            setActiveMovie: (movie) => set({ activeMovie: movie }),

            // Runtime
            selectedRuntime: 'all',
            setRuntime: (runtime) => set({ selectedRuntime: runtime }),

            // Rating
            minRating: 0,
            setMinRating: (rating) => set({ minRating: rating }),

            // Watch Providers
            selectedWatchProviders: [],
            toggleWatchProvider: (providerId) => set((state) => {
                const isSelected = state.selectedWatchProviders.includes(providerId);
                return {
                    selectedWatchProviders: isSelected
                        ? state.selectedWatchProviders.filter(id => id !== providerId)
                        : [...state.selectedWatchProviders, providerId]
                };
            }),

            // Sort
            sortBy: 'primary_release_date.desc',
            setSortBy: (sort) => set({ sortBy: sort }),

            page: 1,
            setPage: (page) => set({ page }),
            addMovies: (newMovies) => set((state) => {
                // Filter duplicates just in case
                const existingIds = new Set(state.movies.map(m => m.id));
                const uniqueNewMovies = newMovies.filter(m => !existingIds.has(m.id));
                return { movies: [...state.movies, ...uniqueNewMovies] };
            }),

            totalResults: 0,
            setTotalResults: (total) => set({ totalResults: total }),

            resetFilters: () => set((state) => ({
                selectedMoods: [],
                selectedLanguages: state.mediaMode === 'anime' ? [] : (state.defaultLanguages || ['en', 'bn', 'hi']),
                selectedYear: null,
                selectedKeywords: [],
                selectedRuntime: 'all',
                minRating: 0,
                selectedWatchProviders: [],
                // Use Defaults
                sortBy: state.defaultSortBy,
                mediaMode: state.mediaMode,

                searchQuery: "",
                page: 1,
                viewFilter: 'discover' // Reset to discover
            })),

            mediaMode: 'movie',
            setMediaMode: (mode) => set({ mediaMode: mode }),

            viewFilter: 'discover',
            setViewFilter: (filter) => set({ viewFilter: filter }),

            activePerson: null,
            setActivePerson: (person) => set({ activePerson: person }),

            // User Identity & Tracking
            user: null,
            setUser: (user) => set((state) => ({
                user,
                // If logging in, switch to UID. If logging out, generate a new Guest ID.
                userId: user ? user.uid : `guest_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
            })),

            userId: `guest_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`, // Simple ID generation
            userName: "Guest User",
            setUserName: (name) => set({ userName: name }),

            cookieConsent: null,
            setCookieConsent: (consent) => set({ cookieConsent: consent }),

            searchHistory: [],
            addToSearchHistory: (query) => set((state) => {
                if (!state.cookieConsent) return {}; // Don't track if no consent
                if (state.searchHistory.includes(query)) return { searchHistory: [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 20) };
                return { searchHistory: [query, ...state.searchHistory].slice(0, 20) };
            }),

            clickHistory: [],
            addToClickHistory: (id, type) => set((state) => {
                if (!state.cookieConsent) return {}; // Don't track if no consent
                const entry = { id, type, timestamp: Date.now() };
                return { clickHistory: [entry, ...state.clickHistory].slice(0, 50) };
            }),

            // Preferences
            defaultMediaMode: 'movie',
            setDefaultMediaMode: (mode) => {
                set({ defaultMediaMode: mode, mediaMode: mode });
                document.cookie = `default_media_mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
            },
            defaultSortBy: 'primary_release_date.desc',
            setDefaultSortBy: (sort) => {
                set({ defaultSortBy: sort, sortBy: sort });
                document.cookie = `default_sort_by=${sort}; path=/; max-age=31536000; SameSite=Lax`;
            },
            defaultLanguages: ['en', 'bn', 'hi'],
            setDefaultLanguages: (langs) => {
                set({ defaultLanguages: langs, selectedLanguages: langs });
                document.cookie = `default_languages=${langs.join(',')}; path=/; max-age=31536000; SameSite=Lax`;
            },

            syncStatus: 'idle',
            setSyncStatus: (status) => set({ syncStatus: status }),
        }),
        {
            name: 'mood-cinema-cache-v1',
            partialize: (state) => ({
                watchedMovies: state.watchedMovies,
                likedMovies: state.likedMovies,
                dislikedMovies: state.dislikedMovies,
                watchlistMovies: state.watchlistMovies,
                sensitiveMode: state.sensitiveMode,
                includeAdult: state.includeAdult,
                hideWatched: state.hideWatched,
                selectedLanguages: state.selectedLanguages,
                selectedKeywords: state.selectedKeywords,
                selectedYear: state.selectedYear,
                userId: state.userId,
                userName: state.userName,
                cookieConsent: state.cookieConsent,
                searchHistory: state.searchHistory,
                clickHistory: state.clickHistory,
                // Persist Preferences
                defaultMediaMode: state.defaultMediaMode,
                defaultSortBy: state.defaultSortBy,
                defaultLanguages: state.defaultLanguages,
                // Persist Current State too?
                mediaMode: state.mediaMode,
                sortBy: state.sortBy,
            }),
        }
    )
);
