"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useMovieStore } from "@/store/useMovieStore";
import { searchMulti, MultiSearchResult, fetchTrending, fetchMovieRecommendations } from "@/lib/tmdb";
import { parseSearchIntent, SearchIntent } from "@/lib/searchLogic";
import { OmniSearchTile } from "./OmniSearchTile";
import { motion, AnimatePresence } from "framer-motion";
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

export function OmniSearch({ manualOpen, onClose }: { manualOpen?: boolean; onClose?: () => void }) {
    const router = useRouter();
    const {
        searchQuery, setSearchQuery,
        watchedMovies, includeAdult,
        addToSearchHistory, addToClickHistory,
        searchHistory, // Access history from store
        selectedMoods
    } = useMovieStore();

    const [input, setInput] = useState(searchQuery);
    const [results, setResults] = useState<MultiSearchResult[]>([]);
    const [trending, setTrending] = useState<MultiSearchResult[]>([]);
    const [intent, setIntent] = useState<SearchIntent | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const debouncedInput = useDebounce(input, 300);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Helper to close everything
    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    // Sync input
    useEffect(() => { setInput(searchQuery); }, [searchQuery]);

    // External Trigger (Mobile)
    useEffect(() => {
        if (manualOpen) {
            setIsOpen(true);
        }
    }, [manualOpen]);

    // Fetch Trending Once (for Zero State)
    useEffect(() => {
        fetchTrending('week').then(data => {
            // Normalize slightly to fit MultiSearchResult if needed, but it should match mostly
            setTrending(data as unknown as MultiSearchResult[]);
        });
    }, []);

    // Perform Search Logic
    useEffect(() => {
        if (!debouncedInput || debouncedInput.trim().length === 0) {
            setResults([]);
            setIntent(null);
            return;
        }

        setIsLoading(true);
        setIsOpen(true);

        const detectedIntent = parseSearchIntent(debouncedInput);
        setIntent(detectedIntent);

        const performSearch = async () => {
            try {
                // HANDLE "SIMILAR TO" INTENT
                if (detectedIntent.type === 'similar' && detectedIntent.query) {
                    // 1. Find the target entity (Movie/TV)
                    const targets = await searchMulti(detectedIntent.query, includeAdult);

                    if (targets.length > 0) {
                        const bestMatch = targets[0]; // Assume first result is what user meant
                        const validMedia = bestMatch.media_type === 'movie' || bestMatch.media_type === 'tv';

                        if (validMedia) {
                            // 2. Fetch Recommendations
                            const recs = await fetchMovieRecommendations(bestMatch.id, 1, bestMatch.media_type as 'movie' | 'tv');
                            // Normalize to MultiSearchResult kind of structure if needed, luckily types overlap mostly
                            // We might need to inject media_type since recommendations might not have it in raw fetch?
                            // fetchMovieRecommendations does normalizeMedia which adds media_type.

                            // Sort by match score isn't really applicable to recs, they are already ranked by TMDB.
                            // But let's apply our de-prioritize watched logic.
                            const processed = (recs as unknown as MultiSearchResult[]).map(item => {
                                let score = item.vote_average || 0;
                                if (watchedMovies.includes(item.id)) score -= 20;
                                return { ...item, score };
                            }); // .sort not strictly needed if we trust TMDB order, but let's keep it clean

                            setResults(processed);
                            setIsLoading(false);
                            return; // EXIT EARLY
                        }
                    }
                    // If target not found or not valid media, fall through to normal search
                }

                // NORMAL SEARCH
                const data = await searchMulti(debouncedInput, includeAdult);
                const processed = data.map(item => {
                    let score = 0;
                    if (item.media_type === 'movie') score += 10;
                    if (item.media_type === 'person') score += 15;

                    const text = item.title || item.name || "";
                    if (text.toLowerCase().startsWith(debouncedInput.toLowerCase())) score += 10;
                    if (text.toLowerCase() === debouncedInput.toLowerCase()) score += 20;

                    if (watchedMovies.includes(item.id)) score -= 20;

                    return { ...item, score };
                }).sort((a, b) => b.score - a.score);

                setResults(processed);
            } catch (error) {
                console.error("Search Failed", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();

    }, [debouncedInput, watchedMovies, includeAdult]);

    // Keyboard Nav (Shared)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;
        const activeList = (input.trim().length === 0) ? trending : results; // Switch based on mode

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < activeList.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && activeList[selectedIndex]) {
                handleResultSelect(activeList[selectedIndex]);
            } else {
                submitSearch(input);
            }
        } else if (e.key === 'Escape') {
            handleClose();
            inputRef.current?.blur();
        }
    };

    const submitSearch = (query: string) => {
        if (!query.trim()) return;
        setSearchQuery(query);
        addToSearchHistory(query);
        handleClose();
        router.push(`/home/search?q=${encodeURIComponent(query)}`);
    };

    const handleResultSelect = (result: MultiSearchResult) => {
        if (!result) return;
        addToClickHistory(result.id, result.media_type as any);

        // Check Intent for "Movies like..."
        // If we had a 'similar' intent, we might want to trigger that search instead of navigation.
        // But for now, let's stick to direct navigation or explicit search page.

        let path = '';
        if (result.media_type === 'movie') path = `/moviedetails/${result.id}`;
        else if (result.media_type === 'tv') path = `/showdetails/${result.id}`;
        else if (result.media_type === 'person') path = `/castdetails/${result.id}`;
        else path = `/home/search?q=${encodeURIComponent(result.title || result.name || '')}`;

        if (path) {
            setInput("");
            handleClose();
            router.push(path);
        }
    };

    // Click Outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                handleClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ... (keep logic above same, only changing render)
    const showZeroState = isOpen && input.trim().length === 0;
    const showResults = isOpen && input.trim().length > 0;

    // We only render the overlay if isOpen is true to avoid layout thrashing, 
    // but the input might be inside a provider or header. 
    // Actually, to make it "Full Screen", we might need to portal it or just use fixed positioning to cover everything.

    // Effect to lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Back Gesture Support (Mobile & Desktop)
    useEffect(() => {
        if (isOpen) {
            // Push a dummy state so 'Back' closes the modal instead of navigating back history
            window.history.pushState({ searchOpen: true }, "");

            const handlePopState = () => {
                handleClose();
            };

            window.addEventListener('popstate', handlePopState);

            return () => {
                window.removeEventListener('popstate', handlePopState);
            };
        }
    }, [isOpen]);

    return (
        <>
            {/* TRIGGER / HEADER SEARCH BAR (When closed or initial state) */}
            {/* We keep a placeholder in the header to expand from, OR we just render the fullscreen overlay over it. */}
            {/* Let's render the header input as usual, but when focused/active, we mount the overlay. */}

            <div ref={containerRef} className={`w-full max-w-3xl relative z-50 transition-all duration-300 ${isOpen ? '' : ''}`}>

                {/* COMPACT INPUT (Visible when closed) */}
                <div className={`relative ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        onFocus={() => setIsOpen(true)}
                        placeholder="Search movies, people..."
                        className="
                            block w-full pl-12 pr-4 py-2.5
                            bg-white/10 backdrop-blur-md border border-white/20
                            text-white placeholder:text-gray-400
                            rounded-full shadow-sm hover:bg-white/20 transition-all
                            focus:outline-none
                        "
                    />
                </div>

                {/* FULL SCREEN OVERLAY */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-lg flex flex-col"
                        >
                            {/* HEADER SECTION */}
                            <div className="flex-shrink-0 border-b border-black/5 bg-white/50 p-4 md:p-6 shadow-sm">
                                <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
                                    <Search className="w-6 h-6 text-indigo-600" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                        placeholder="Type to search..."
                                        className="
                                            flex-1 bg-transparent border-none outline-none 
                                            text-2xl md:text-4xl font-bold text-black placeholder:text-gray-400
                                        "
                                    />
                                    <div className="hidden md:flex items-center gap-4">
                                        {isLoading && <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />}
                                        <button
                                            onClick={handleClose}
                                            className="p-2 rounded-full hover:bg-black/5 text-gray-400 hover:text-black transition-colors"
                                        >
                                            <span className="sr-only">Close</span>
                                            <span className="text-sm font-medium tracking-widest uppercase">Esc</span>
                                        </button>
                                    </div>
                                </div>

                                {/* INTENT / SUGGESTIONS */}
                                {intent && intent.type !== 'text' && (
                                    <div className="max-w-7xl mx-auto mt-2">
                                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30">
                                            {intent.type === 'similar' ? '✨ Recommendation Mode' : '🔎 Smart Filter'}
                                            <span className="opacity-75 font-normal text-white">
                                                {intent.type === 'similar' ? `Finding movies like "${intent.query}"` : `Filtering: ${intent.query}`}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* RESULTS GRID SCROLLABLE AREA */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                                <div className="max-w-7xl mx-auto">
                                    {showZeroState && (
                                        <div className="space-y-8">
                                            {/* Recent Searches */}
                                            {searchHistory.length > 0 && (
                                                <div className="space-y-4">
                                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {searchHistory.slice(0, 5).map((term, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => submitSearch(term)}
                                                                className="px-4 py-2 rounded-full bg-black/5 border border-black/5 text-gray-600 hover:bg-black/10 hover:text-black hover:border-black/20 transition-all text-sm"
                                                            >
                                                                {term}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Trending */}
                                            <div className="space-y-4">
                                                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                    Trending Now
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                                    {trending.slice(0, 6).map((item, index) => (
                                                        <OmniSearchTile
                                                            key={item.id}
                                                            item={item}
                                                            isSelected={index === selectedIndex}
                                                            onSelect={handleResultSelect}
                                                            onMouseEnter={() => setSelectedIndex(index)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {showResults && !isLoading && results.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <h3 className="text-xl font-bold text-black">Top Results</h3>
                                                <button
                                                    onClick={() => submitSearch(input)}
                                                    className="text-sm text-indigo-600 hover:text-black transition-colors"
                                                >
                                                    View All Results
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                                {results.map((item, index) => (
                                                    <OmniSearchTile
                                                        key={`${item.media_type}-${item.id}`}
                                                        item={item}
                                                        isSelected={index === selectedIndex}
                                                        onSelect={handleResultSelect}
                                                        onMouseEnter={() => setSelectedIndex(index)}
                                                    />
                                                ))}
                                            </div>

                                            <div className="py-12 flex justify-center">
                                                <button
                                                    onClick={() => submitSearch(input)}
                                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all transform hover:scale-105"
                                                >
                                                    See All Results for "{input}"
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {showResults && !isLoading && results.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500 pt-20">
                                            <Search className="w-16 h-16 mb-4 opacity-20" />
                                            <p className="text-xl font-medium">No results found for "{input}"</p>
                                            <p className="text-sm mt-2 opacity-50">Try checking your spelling or use different keywords.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
