"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Film, User, Hash, Loader2, ArrowRight } from "lucide-react";
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
        includeAdult, setActivePerson
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
                handleSelect(results[selectedIndex]);
            } else {
                // Submit raw query if nothing selected
                setSearchQuery(input);
                setIsOpen(false);
                router.push(`/home/search?q=${encodeURIComponent(input)}`);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleSelect = (item: MultiSearchResult) => {
        if (item.media_type === 'movie') {
            router.push(`/moviedetails/${item.id}`);
            // setSearchQuery(item.title || ""); // Optional: keep search text? No, clearer to just navigate.
            // setInput(item.title || "");
        } else if (item.media_type === 'person') {
            // Open Person Modal
            setActivePerson({
                id: item.id,
                name: item.name || "",
                // Partial fill
                biography: "",
                birthday: "",
                place_of_birth: "",
                profile_path: item.profile_path || "",
                known_for_department: "Acting"
            });
            setIsOpen(false);
            setSearchQuery(""); // Clear search to show grid? Or keep it? Clear it usually better
            setInput("");
        }
        setIsOpen(false);
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

            {/* Overlay Effect when active */}
            {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-[1px] -z-10 animate-in fade-in duration-300 pointer-events-none" />}

            {/* Input Wrapper */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setSearchQuery(input);
                    setIsOpen(false);
                    router.push(`/home/search?q=${encodeURIComponent(input)}`);
                }}
                className="relative"
            >
                <button
                    type="submit"
                    className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 hover:text-indigo-400 transition-colors z-10 cursor-pointer"
                >
                    <Search className={`w-4 h-4 ${isOpen || input ? 'text-indigo-400' : ''}`} />
                </button>

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
                    placeholder="Search titles, actors, or keywords..."
                    className={`
                        block w-full pl-11 pr-4 py-3 
                        bg-white border text-sm transition-all duration-300
                        ${isOpen
                            ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)] text-black'
                            : 'border-black/5 text-gray-700 hover:border-black/20'
                        }
                        rounded-xl focus:outline-none placeholder:text-gray-400
                    `}
                />

                {/* Loading Bar */}
                {isLoading && (
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-indigo-500/20 overflow-hidden rounded-t-xl">
                        <div className="h-full bg-indigo-500 w-1/3 animate-[shimmer_1s_infinite]" />
                    </div>
                )}
            </form>

            {/* Dropdown Results */}
            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto custom-scrollbar"
                    >
                        <div className="py-2">
                            {results.map((item, index) => {
                                const isSelected = index === selectedIndex;
                                return (
                                    <button
                                        key={`${item.media_type}-${item.id}`}
                                        onClick={() => handleSelect(item)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`
                                            w-full flex items-center gap-4 px-4 py-3 text-left transition-colors duration-150
                                            ${isSelected ? 'bg-[#161616] border-l-2 border-indigo-500' : 'border-l-2 border-transparent hover:bg-[#111111]'}
                                        `}
                                    >
                                        {/* Poster / Avatar */}
                                        <div className="w-10 h-14 relative flex-shrink-0 bg-neutral-900 rounded overflow-hidden border border-white/5">
                                            {(item.poster_path || item.profile_path) ? (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`}
                                                    alt={item.title || item.name || "Visual"}
                                                    fill
                                                    className={`object-cover ${item.adult ? 'blur-sm scale-110' : ''}`}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                    {item.media_type === 'person' ? <User size={16} /> : <Film size={16} />}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                                    {item.title || item.name}
                                                </span>
                                                {item.adult && (
                                                    <span className="bg-rose-500/20 text-rose-400 text-[10px] px-1.5 rounded font-bold border border-rose-500/20">
                                                        18+
                                                    </span>
                                                )}
                                                {/* Smart Badge: Mood Match? */}
                                                {/* Logic placeholder: if (item.score > x) ... */}
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                {item.release_date && (
                                                    <span>{item.release_date.split('-')[0]}</span>
                                                )}
                                                {item.vote_average && item.vote_average > 0 && (
                                                    <span className="flex items-center gap-1 text-yellow-500/80">
                                                        ★ {item.vote_average.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Type Badge */}
                                        <div className={`
                                            text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded
                                            ${item.media_type === 'movie' ? 'bg-indigo-500/10 text-indigo-400' :
                                                item.media_type === 'person' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-800 text-gray-400'}
                                        `}>
                                            {item.media_type === 'movie' ? 'Movie' : item.media_type === 'person' ? 'Person' : 'Media'}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
