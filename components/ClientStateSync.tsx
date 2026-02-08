"use client";

import { useEffect, useRef } from "react";
import { useMovieStore } from "@/store/useMovieStore";
import { FilterParams } from "@/lib/constants";
import { fetchKeywordDetails } from "@/lib/tmdb";

interface ClientStateSyncProps {
    newParams: FilterParams;
}

export function ClientStateSync({ newParams }: ClientStateSyncProps) {
    const {
        setMediaMode,
        setSearchQuery,
        // We need 'bulk set' methods or call individual ones
        movies,
        selectedMoods, toggleMood,
        selectedLanguages, toggleLanguage,
        selectedKeywords, addKeyword, removeKeyword, // Store has add/remove, no 'set'
        activePerson // etc
    } = useMovieStore();

    // We need direct setters in the store for bulk updates to avoid firing listeners multiple times
    // or we just use useMovieStore.setState() directly?
    // Accessing setState via the hook is not standard -> useMovieStore.setState(...) import?

    // Better to just add a `syncFromUrl` action to the store?
    // That would be cleaner. 
    // For now, let's use the hook + local logic or add a method to store.
    // Adding `syncFilters` to store is best.

    const isFirstMount = useRef(true);

    useEffect(() => {
        const syncState = async () => {
            // 1. Initial State Sync (Optimistic / Fast)
            const initialKeywords = newParams.userKeywords.map(idStr => {
                const id = parseInt(idStr);
                const existing = useMovieStore.getState().selectedKeywords.find(k => k.id === id);
                return existing || { id, name: idStr }; // Temporary fallback
            });

            // Determine effective media mode to decide on defaults
            const currentState = useMovieStore.getState();
            const effectiveMode = newParams.mediaMode || currentState.mediaMode;
            const isDefaultMode = effectiveMode === currentState.defaultMediaMode;

            useMovieStore.setState((state) => ({
                mediaMode: effectiveMode, // syncing mediaMode from URL might be tricky if route handles it.
                searchQuery: newParams.query || "",
                selectedMoods: newParams.moods || [],
                selectedLanguages: (newParams.languages && newParams.languages.length > 0)
                    ? newParams.languages
                    : ((isDefaultMode && effectiveMode !== 'anime') ? (currentState.defaultLanguages || ['en', 'bn', 'hi']) : []),
                selectedYear: newParams.year || null,
                includeAdult: newParams.includeAdult || currentState.includeAdult, // Persist or Default?
                selectedRuntime: newParams.runtime || 'all',
                minRating: newParams.minRating || 0,
                selectedWatchProviders: newParams.watchProviders || [],
                sortBy: newParams.sortBy || ((isDefaultMode && effectiveMode !== 'anime') ? currentState.defaultSortBy : 'popularity.desc'),
                selectedKeywords: initialKeywords
            }));

            // 2. Resolve Missing Keyword Names (Lazy)
            const missingKeywords = initialKeywords.filter(k => k.name === k.id.toString());
            if (missingKeywords.length > 0) {
                // console.log("Resolving keyword names for:", missingKeywords);
                const resolved = await Promise.all(
                    missingKeywords.map(async (k) => {
                        try {
                            const details = await fetchKeywordDetails(k.id);
                            return details || k;
                        } catch {
                            return k;
                        }
                    })
                );

                // Update Store with Resolved Names
                useMovieStore.setState((state) => ({
                    selectedKeywords: state.selectedKeywords.map(k => {
                        const match = resolved.find(r => r.id === k.id);
                        return match ? match : k;
                    })
                }));
            }
        };

        syncState();

    }, [newParams]);

    return null;
}
