"use client";

import { useEffect, useRef } from "react";
import { useMovieStore } from "@/store/useMovieStore";
import { FilterParams } from "@/lib/constants";

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
        // We only want to sync if the params are truly different from current state?
        // Or blindly sync on mount/update?
        // Since this component is rendered by the Server Page, it reflects the 'Source of Truth' (URL).
        // So we should enforce it.

        useMovieStore.setState((state) => ({
            mediaMode: newParams.mediaMode || state.mediaMode,
            searchQuery: newParams.query || "",
            selectedMoods: newParams.moods || [],
            selectedLanguages: newParams.languages || [],
            selectedYear: newParams.year || null,
            includeAdult: newParams.includeAdult || false,
            selectedRuntime: newParams.runtime || 'all',
            minRating: newParams.minRating || 0,
            selectedWatchProviders: newParams.watchProviders || [],
            sortBy: newParams.sortBy || 'popularity.desc',

            // Keywords: tricky because URL has ["123"], Store has [{id:123, name:?}]
            // If store has the keyword, keep the name. If not, add placeholder.
            selectedKeywords: newParams.userKeywords.map(idStr => {
                const id = parseInt(idStr);
                const existing = state.selectedKeywords.find(k => k.id === id);
                return existing || { id, name: `${id}` }; // Fallback name
            })
        }));

    }, [newParams]);

    return null;
}
