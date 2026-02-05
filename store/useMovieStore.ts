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

    likedMovies: number[];
    toggleLike: (id: number) => void;

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
    resetFilters: () => void;

    // Global Media Mode
    mediaMode: 'movie' | 'tv' | 'anime';
    setMediaMode: (mode: 'movie' | 'tv' | 'anime') => void;

    activePerson: Person | null;
    setActivePerson: (person: Person | null) => void;
}

export const useMovieStore = create<MovieState>()(
    persist(
        (set) => ({
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

            selectedLanguages: [],
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

            likedMovies: [],
            toggleLike: (id) => set((state) => {
                const isLiked = state.likedMovies.includes(id);
                return {
                    likedMovies: isLiked
                        ? state.likedMovies.filter(m => m !== id)
                        : [...state.likedMovies, id]
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

            resetFilters: () => set({
                selectedMoods: [],
                selectedLanguages: [],
                selectedYear: null,
                selectedKeywords: [],
                selectedRuntime: 'all',
                minRating: 0,
                selectedWatchProviders: [],
                sortBy: 'primary_release_date.desc',
                searchQuery: "",
                page: 1,
                mediaMode: 'movie' // Default
            }),

            mediaMode: 'movie',
            setMediaMode: (mode) => set({ mediaMode: mode }),

            activePerson: null,
            setActivePerson: (person) => set({ activePerson: person }),
        }),
        {
            name: 'mood-cinema-storage',
            partialize: (state) => ({
                watchedMovies: state.watchedMovies,
                likedMovies: state.likedMovies,
                sensitiveMode: state.sensitiveMode,
                includeAdult: state.includeAdult,
                selectedLanguages: state.selectedLanguages,
                selectedKeywords: state.selectedKeywords,
                selectedYear: state.selectedYear
            }),
        }
    )
);
