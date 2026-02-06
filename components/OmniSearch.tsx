"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Film, User, Hash, Loader2, ArrowRight, Star } from "lucide-react";
import { useMovieStore } from "@/store/useMovieStore";
import { searchMulti, MultiSearchResult } from "@/lib/tmdb";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Helper hook for debounce
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export function OmniSearch() {
    const router = useRouter(); // <--- Add this
    const {
        searchQuery, setSearchQuery,
        selectedMoods, watchedMovies, selectedLanguages,
        includeAdult, setActivePerson,
        addToSearchHistory, addToClickHistory // Tracking
    } = useMovieStore();

    const [input, setInput] = useState(searchQuery);
    const [results, setResults] = useState<MultiSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const debouncedInput = useDebounce(input, 300);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync local input with store if changed elsewhere (e.g. clear filters)
    useEffect(() => {
        setInput(searchQuery);
    }, [searchQuery]);

    // Perform Search
    useEffect(() => {
        if (!debouncedInput || debouncedInput.trim().length === 0) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setIsOpen(true);

        searchMulti(debouncedInput, includeAdult).then(data => {
            // --- SMART FILTERING & RANKING ---

            // 1. Filter out Person/TV if strictly movie focused? No, let's keep them but maybe deprioritize.
            // The directive said: Categorize into Movies, People, Keywords.

            // 2. Personalization logic
            const processed = data.map(item => {
                let score = 0;

                // Boost Mood Matches (Conceptually mapping Genres to Moods)
                // This is a simplified check since we don't have the full genre map here easily avail 
                // without importing the huge object, but we can check if we loaded it or pass genre IDs.
                // For now, simpler: Boost Movies over TV/People
                // Match weighting
                if (item.media_type === 'movie') score += 10;
                if (item.media_type === 'person') score += 15; // Boost people higher to ensure visibility in mixed results

                // Boost items with matching query in title (relevance)
                const text = item.title || item.name || "";
                if (text.toLowerCase().startsWith(debouncedInput.toLowerCase())) score += 10;
                if (text.toLowerCase() === debouncedInput.toLowerCase()) score += 20; // Exact match super boost

                // De-prioritize Watched (if we have IDs)
                if (watchedMovies.includes(item.id)) score -= 20;

                return { ...item, score };
            }).sort((a, b) => b.score - a.score);

            setResults(processed);
            setIsLoading(false);
        });

    }, [debouncedInput, watchedMovies, includeAdult]);

    // Keyboard Nav
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && results[selectedIndex]) {
                handleResultSelect(results[selectedIndex]);
            } else {
                // Submit raw query if nothing selected
                setSearchQuery(input);
                addToSearchHistory(input); // Trace
                setIsOpen(false);
                router.push(`/home/search?q=${encodeURIComponent(input)}`);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleResultSelect = (result: MultiSearchResult) => {
        if (!result) return;

        // Trace Click
        addToClickHistory(result.id, result.media_type as any);

        let path = '';
        if (result.media_type === 'movie') {
            path = `/moviedetails/${result.id}`;
        } else if (result.media_type === 'tv') {
            path = `/showdetails/${result.id}`;
        } else if (result.media_type === 'person') {
            path = `/castdetails/${result.id}`;
        } else {
            // Fallback for unknown types or 'multi' results that might be something else
            // If we don't know, maybe just search it?
            path = `/home/search?query=${encodeURIComponent(result.title || result.name || '')}`;
        }

        if (path) {
            setSearchQuery(""); // Clear search on navigation? Or keep it? Usually clear.
            setInput(""); // Clear local input
            setIsOpen(false);
            router.push(path);
        }
    };

    // Click Outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    return (
        <div ref={containerRef} className="w-full max-w-xl relative group z-50">

            {/* Global Overlay (Focus Mode) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10"
                    />
                )}
            </AnimatePresence>

            {/* SEARCH INPUT */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (input.trim()) {
                        setSearchQuery(input);
                        addToSearchHistory(input);
                        setIsOpen(false);
                        router.push(`/home/search?q=${encodeURIComponent(input)}`);
                    }
                }}
                className="relative"
            >
                {/* Search Icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Search className={`w-5 h-5 transition-colors duration-300 ${isOpen ? 'text-indigo-400' : 'text-gray-400'}`} />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        if (!isOpen && e.target.value.trim().length > 0) setIsOpen(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (input.trim().length > 0) setIsOpen(true); }}
                    placeholder="Search movies, shows, people..."
                    className={`
                        block w-full pl-12 pr-10 py-3.5
                        bg-white/90 backdrop-blur-md border border-white/20
                        text-black placeholder:text-gray-500
                        rounded-2xl shadow-sm transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white focus:shadow-xl focus:scale-[1.01]
                    `}
                />

                {/* Clear / Loading Indicator */}
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    ) : input ? (
                        <button
                            type="button"
                            onClick={() => { setInput(""); if (inputRef.current) inputRef.current.focus(); }}
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">✕</div>
                        </button>
                    ) : null}
                </div>
            </form>

            {/* RESULTS DROPDOWN */}
            <AnimatePresence>
                {isOpen && (input.length > 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-3 bg-white/80 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5"
                    >
                        {/* Loading Skeletons */}
                        {isLoading && results.length === 0 && (
                            <div className="p-2 space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
                                        <div className="w-12 h-16 bg-black/5 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-black/5 rounded w-3/4" />
                                            <div className="h-3 bg-black/5 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* No Results */}
                        {!isLoading && results.length === 0 && debouncedInput && (
                            <div className="p-8 text-center text-gray-400">
                                <Film className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">No results found for "{input}"</p>
                            </div>
                        )}

                        {/* Results List */}
                        {!isLoading && results.length > 0 && (
                            <div className="py-2 max-h-[65vh] overflow-y-auto custom-scrollbar">
                                {results.map((item, index) => {
                                    const isSelected = index === selectedIndex;
                                    return (
                                        <motion.button
                                            key={`${item.media_type}-${item.id}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }} // Staggered entry
                                            onClick={() => handleResultSelect(item)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`
                                                w-full flex items-center gap-4 px-4 py-3 text-left transition-all duration-200 group
                                                ${isSelected
                                                    ? 'bg-black/5'
                                                    : 'hover:bg-black/5'}
                                            `}
                                        >
                                            {/* Poster */}
                                            <div className={`
                                                w-12 h-16 relative flex-shrink-0 rounded-lg overflow-hidden shadow-sm transition-transform duration-300
                                                ${isSelected ? 'scale-105 shadow-md' : ''}
                                            `}>
                                                {(item.poster_path || item.profile_path) ? (
                                                    <Image
                                                        src={`https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`}
                                                        alt={item.title || item.name || "Visual"}
                                                        fill
                                                        className={`object-cover ${item.adult ? 'blur-sm grayscale' : ''}`}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                        {item.media_type === 'person' ? <User size={18} /> : <Film size={18} />}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className={`text-base font-semibold truncate transition-colors ${isSelected ? 'text-black' : 'text-gray-800'}`}>
                                                        {item.title || item.name}
                                                    </h4>
                                                    {item.adult && (
                                                        <span className="text-[10px] bg-rose-100 text-rose-600 px-1 rounded border border-rose-200 font-bold">18+</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mt-1">
                                                    {/* Badge */}
                                                    <span className={`
                                                        text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider
                                                        ${item.media_type === 'movie' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                                            item.media_type === 'person' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                                                'bg-orange-50 border-orange-100 text-orange-600'}
                                                    `}>
                                                        {item.media_type === 'movie' ? 'Movie' : item.media_type === 'person' ? 'Person' : 'TV'}
                                                    </span>

                                                    {/* Meta */}
                                                    <span className="text-xs text-gray-400 flex items-center gap-2">
                                                        {item.release_date && <span>{item.release_date.split('-')[0]}</span>}
                                                        {item.vote_average && item.vote_average > 0 && (
                                                            <span className="flex items-center gap-0.5 text-yellow-500 font-medium">
                                                                <Star size={10} fill="currentColor" /> {item.vote_average.toFixed(1)}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Icon (Arrow) */}
                                            <div className={`
                                                pr-2 text-gray-400 bg-transparent
                                                transition-all duration-300 transform
                                                ${isSelected ? 'translate-x-0 opacity-100 text-indigo-500' : 'translate-x-2 opacity-0'}
                                            `}>
                                                <ArrowRight size={18} />
                                            </div>

                                        </motion.button>
                                    );
                                })}

                                <div className="p-2 border-t border-black/5 mt-2">
                                    <button
                                        onClick={() => {
                                            setSearchQuery(input);
                                            setIsOpen(false);
                                            router.push(`/home/search?q=${encodeURIComponent(input)}`);
                                        }}
                                        className="w-full text-center text-xs font-bold text-indigo-600 hover:underline py-2"
                                    >
                                        View all results for "{input}"
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
