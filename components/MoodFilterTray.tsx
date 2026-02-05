"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { searchKeywords } from "@/lib/tmdb";
import { type Mood, MOOD_MAPPINGS, type FilterParams } from "@/lib/constants";
import { MicroButton } from "./ui/MicroButton";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, ChevronDown, Search, X, BookOpen, Home } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { HelpModal } from "./HelpModal";
import { OmniSearch } from "./OmniSearch";
import { MediaTypeToggle } from "./MediaTypeToggle";
import { useRouter, usePathname } from "next/navigation"; // New
import { createUrlString } from "@/lib/urlUtils"; // New

// Inline custom debounce hook
function useDebounceState<T>(value: T, delay: number): T {
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

// Match the updated Mood type from tmdb.ts
const MOODS: Mood[] = ['chilled', 'adrenaline', 'dark', 'cheerful', 'mind-bending', 'romantic', 'inspiring', 'intense'];
const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ko', label: 'Korean' },
    { code: 'ja', label: 'Japanese' },
    { code: 'es', label: 'Spanish' },
    { code: 'bn', label: 'Bengali' },
];

export function MoodFilterTray() {
    const router = useRouter(); // URL Handling
    const pathname = usePathname();

    const {
        selectedMoods, // Read Only
        selectedLanguages,
        selectedKeywords,
        selectedYear,
        searchQuery,
        // Advanced Filters
        selectedRuntime,
        minRating,
        selectedWatchProviders,
        sortBy,
        mediaMode = 'movie', // Default fallback
        includeAdult
    } = useMovieStore();

    // Helper to push updates
    const updateUrl = (updates: Partial<FilterParams>) => {
        // Construct current params from Store state (Synced Source of Truth)
        const currentParams: Partial<FilterParams> = {
            moods: selectedMoods,
            languages: selectedLanguages,
            userKeywords: selectedKeywords.map(k => k.id.toString()),
            year: selectedYear,
            query: searchQuery,
            runtime: selectedRuntime,
            minRating: minRating,
            watchProviders: selectedWatchProviders,
            sortBy: sortBy,
            includeAdult: includeAdult,
            // Media Mode is implicit in Pathname usually, or store. 
            // We don't usually set mediaMode via filter tray (toggle does that).
        };

        const merged = { ...currentParams, ...updates };
        const url = createUrlString(pathname, merged);
        router.push(url);
    };

    const handleToggleMood = (mood: Mood) => {
        const newMoods = selectedMoods.includes(mood)
            ? selectedMoods.filter(m => m !== mood)
            : [...selectedMoods, mood];
        updateUrl({ moods: newMoods });
    };

    const handleToggleLanguage = (lang: string) => {
        const newLangs = selectedLanguages.includes(lang)
            ? selectedLanguages.filter(l => l !== lang)
            : [...selectedLanguages, lang];
        updateUrl({ languages: newLangs });
    };

    const handleToggleProvider = (id: string) => {
        const newProviders = selectedWatchProviders.includes(id)
            ? selectedWatchProviders.filter(p => p !== id)
            : [...selectedWatchProviders, id];
        updateUrl({ watchProviders: newProviders });
    };

    const handleAddKeyword = (k: { id: number, name: string }) => {
        // Store ID. 
        // Note: Logic allows duplicates in list momentarily if not careful, but Set in URL utils handles uniqueness? 
        // No, URL utils joins. We should filter.
        const bucket = selectedKeywords.map(kw => kw.id);
        if (!bucket.includes(k.id)) {
            const newIds = [...bucket, k.id].map(String);
            updateUrl({ userKeywords: newIds });
        }
    };

    const handleRemoveKeyword = (id: number) => {
        const newIds = selectedKeywords.filter(k => k.id !== id).map(k => k.id.toString());
        updateUrl({ userKeywords: newIds });
    };

    const handleReset = () => {
        router.push(pathname); // Clear search params
    };

    const [showFilters, setShowFilters] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
    const [keywordInput, setKeywordInput] = useState("");
    const [keywordResults, setKeywordResults] = useState<{ id: number, name: string }[]>([]);
    const debouncedKeyword = useDebounceState(keywordInput, 300);

    // Dynamic Mood List
    const displayedMoods: Mood[] = mediaMode === 'anime' ? [...MOODS, 'Hentai'] : MOODS;

    useEffect(() => {
        if (debouncedKeyword.length > 2) {
            searchKeywords(debouncedKeyword).then(setKeywordResults);
        } else {
            setKeywordResults([]);
        }
    }, [debouncedKeyword]);

    return (
        <div className="flex flex-col items-center gap-6 py-8 w-full max-w-4xl mx-auto font-sans relative">
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

            {/* Help/Guide Button */}
            <button
                onClick={() => setShowHelp(true)}
                className="fixed bottom-6 left-6 z-50 md:absolute md:z-10 md:bottom-auto md:left-0 md:top-8 xl:-left-24 p-3 bg-white border border-black/10 rounded-full text-gray-400 hover:text-black hover:scale-105 hover:shadow-lg transition-all group"
                title="How to use"
            >
                <BookOpen size={20} className="group-hover:text-accent transition-colors" />
            </button>

            {/* Search & Mode Switcher Row */}
            {/* Explicitly visible container with minimum height */}
            {/* Search & Mode Switcher Row */}
            {/* Mobile: Stacked (Row 1: Home+Search, Row 2: Toggle). Desktop: Inline (Home, Search, Toggle) */}
            <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-center relative z-30 min-h-[50px] px-4 md:px-0">

                {/* Row 1 (Mobile) / Left Group (Desktop) */}
                <div className={`
                    w-full md:w-auto flex flex-row gap-4 items-center 
                    justify-center
                    md:justify-center transition-all duration-300
                `}>
                    {/* Home Button (Hidden when mobile search is expanded) */}
                    {!mobileSearchExpanded && (
                        <button
                            onClick={() => router.push('/home')}
                            className="p-3 bg-white border border-black/10 rounded-full text-black hover:bg-black hover:text-white transition-all hover:scale-105 hover:shadow-lg shrink-0"
                            title="Go Home"
                        >
                            <Home size={20} />
                        </button>
                    )}

                    {/* OmniSearch Container */}
                    <div className={`
                        relative z-40 transition-all duration-300 ease-out
                        ${mobileSearchExpanded ? 'w-full block' : 'hidden md:block w-full max-w-md'}
                    `}>
                        <OmniSearch />
                        {/* Mobile Close Button for Search */}
                        {mobileSearchExpanded && (
                            <button
                                onClick={() => setMobileSearchExpanded(false)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-black/40 hover:text-black md:hidden hover:bg-black/5 rounded-full z-50"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {/* Mobile Search Trigger (Visible only on mobile when collapsed) */}
                    {!mobileSearchExpanded && (
                        <button
                            onClick={() => setMobileSearchExpanded(true)}
                            className="md:hidden p-3 bg-white border border-black/10 rounded-full text-black hover:bg-black hover:text-white transition-all hover:scale-105 hover:shadow-lg shrink-0"
                        >
                            <Search size={20} />
                        </button>
                    )}
                </div>

                {/* Row 2 (Mobile) / Right Group (Desktop) */}
                {/* Use w-full flex justify-center on mobile to center the pill */}
                <div className={`shrink-0 relative z-30 w-full md:w-auto flex justify-center md:block transition-all duration-300 ${mobileSearchExpanded ? 'opacity-0 h-0 overflow-hidden md:opacity-100 md:h-auto md:overflow-visible' : 'opacity-100 h-auto'}`}>
                    <MediaTypeToggle />
                </div>
            </div>

            {/* Active Filters Display */}
            {
                (selectedMoods.length > 0 || selectedLanguages.length > 0 || selectedKeywords.length > 0 || selectedYear) && (
                    <div className="w-full max-w-4xl flex flex-wrap items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 relative z-20">
                        <span className="text-xs text-gray-400 mr-2 uppercase tracking-widest font-bold">Active:</span>

                        {/* Clear All */}
                        <button
                            onClick={handleReset}
                            className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full text-xs font-medium transition-colors flex items-center gap-1"
                        >
                            Clear All <X size={10} />
                        </button>

                        {/* Moods */}
                        {selectedMoods.map(mood => (
                            <button key={mood} onClick={() => handleToggleMood(mood)} className="px-3 py-1 bg-black text-white rounded-full text-xs flex items-center gap-1 hover:bg-gray-800 transition-colors">
                                {mood} <X size={10} />
                            </button>
                        ))}

                        {/* Languages */}
                        {selectedLanguages.map(code => (
                            <button key={code} onClick={() => handleToggleLanguage(code)} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs flex items-center gap-1 hover:bg-gray-100 transition-colors">
                                {LANGUAGES.find(l => l.code === code)?.label || code} <X size={10} />
                            </button>
                        ))}

                        {/* Year */}
                        {selectedYear && (
                            <button onClick={() => updateUrl({ year: null })} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs flex items-center gap-1 hover:bg-gray-100 transition-colors">
                                {selectedYear === 'upcoming' ? 'Upcoming' : selectedYear} <X size={10} />
                            </button>
                        )}

                        {/* Keywords */}
                        {selectedKeywords.map(k => (
                            <button key={k.id} onClick={() => handleRemoveKeyword(k.id)} className="px-3 py-1 bg-accent/10 text-accent border border-accent/20 rounded-full text-xs flex items-center gap-1 hover:bg-accent hover:text-white transition-colors">
                                {k.name} <X size={10} />
                            </button>
                        ))}
                    </div>
                )
            }

            {/* Primary Mood Pills - Always visible */}
            <div className="flex flex-wrap gap-2 justify-center transition-opacity duration-300 opacity-100 relative z-20">
                {(displayedMoods || MOODS).map((mood) => {
                    const isActive = selectedMoods.includes(mood);
                    return (
                        <MicroButton
                            key={mood}
                            variant={isActive ? "primary" : "secondary"}
                            onClick={() => handleToggleMood(mood)}
                            className={`capitalize transition-all duration-300 ${isActive ? 'shadow-[0_0_15px_-3px_rgba(99,102,241,0.6)] scale-105' : ''}`}
                        >
                            {mood}
                        </MicroButton>
                    );
                })}
            </div>

            {/* Control Toggle - Always visible */}
            <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                    p-3 rounded-xl border transition-all duration-300 group relative z-20 flex items-center gap-2
                    ${showFilters
                        ? 'bg-black text-white border-black shadow-[0_0_15px_rgba(0,0,0,0.4)]'
                        : 'bg-white text-gray-500 border-gray-200 hover:text-black'}
                `}
            >
                <Settings2 size={12} className="group-hover:text-accent transition-colors" />
                Advanced Filters
                <ChevronDown size={12} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Expanded Control Center */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, y: -20 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden w-full"
                    >
                        <div className="p-5 rounded-2xl bg-white border border-black/10 shadow-xl flex flex-col gap-4">

                            {/* Row 1: Search / Keywords (Full Width) */}
                            <div className="w-full order-1">
                                <div className="flex flex-col gap-3 relative">
                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Specific Keywords</span>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={14} />
                                        <input
                                            type="text"
                                            value={keywordInput}
                                            onChange={(e) => setKeywordInput(e.target.value)}
                                            placeholder="Type genre/topic..."
                                            className="w-full bg-gray-50 border border-black/10 rounded-xl py-2 pl-9 pr-4 text-sm text-black placeholder-gray-400 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                        />
                                        {keywordResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/10 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                                                {keywordResults.map(k => (
                                                    <button
                                                        key={k.id}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                                                        onClick={() => {
                                                            handleAddKeyword(k);
                                                            setKeywordInput("");
                                                            setKeywordResults([]);
                                                        }}
                                                    >
                                                        {k.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-1 min-h-[24px]">
                                        {selectedKeywords.map(k => (
                                            <span key={k.id} className="inline-flex items-center gap-1 bg-accent/10 border border-accent/20 text-accent text-xs px-2 py-1 rounded-md">
                                                {k.name}
                                                <button onClick={() => handleRemoveKeyword(k.id)} className="hover:text-black"><X size={10} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Filter Columns */}
                            <div className="flex flex-col lg:flex-row gap-8 order-2">

                                {/* Column 1: Geography (Left) */}
                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="space-y-3">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Region & Language</span>
                                        <div className="flex flex-wrap gap-2">
                                            {LANGUAGES.map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => handleToggleLanguage(lang.code)}
                                                    className={`
                                            px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200
                                            ${selectedLanguages.includes(lang.code)
                                                            ? 'bg-accent/10 border-accent text-accent shadow-sm'
                                                            : 'bg-black/5 border-transparent text-gray-500 hover:bg-black/10 hover:text-black'}
                                          `}
                                                >
                                                    {lang.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Watch Providers (IN)</span>
                                        <div className="flex flex-wrap gap-3">
                                            {[
                                                { id: '8', name: 'Netflix', color: 'hover:border-red-500 hover:text-red-500' },
                                                { id: '119', name: 'Prime', color: 'hover:border-blue-400 hover:text-blue-400' },
                                                { id: '122', name: 'Hotstar', color: 'hover:border-blue-600 hover:text-blue-600' },
                                                { id: '220', name: 'JioCinema', color: 'hover:border-pink-500 hover:text-pink-500' },
                                                { id: '237', name: 'SonyLIV', color: 'hover:border-purple-500 hover:text-purple-500' },
                                                { id: '232', name: 'Zee5', color: 'hover:border-purple-400 hover:text-purple-400' },
                                                { id: '315', name: 'Hoichoi', color: 'hover:border-orange-500 hover:text-orange-500' },
                                                { id: '660', name: 'Addatimes', color: 'hover:border-cyan-500 hover:text-cyan-500' }
                                            ].map((p) => {
                                                const isSelected = selectedWatchProviders.includes(p.id);
                                                return (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => handleToggleProvider(p.id)}
                                                        className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${isSelected ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200 ' + p.color}`}
                                                    >
                                                        {p.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Column 2: Parameters (Right) */}
                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="flex gap-4">
                                        {/* Year */}
                                        <div className="space-y-3">
                                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Year</span>
                                            <div className="relative">
                                                <select
                                                    value={selectedYear || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'upcoming') updateUrl({ year: 'upcoming' });
                                                        else updateUrl({ year: val ? parseInt(val) : null });
                                                    }}
                                                    className="appearance-none bg-gray-50 border border-black/10 text-gray-700 text-sm rounded-xl focus:ring-accent focus:border-accent block w-28 p-2.5 cursor-pointer hover:bg-black/5 transition-colors"
                                                >
                                                    <option value="">All Time</option>
                                                    <option value="upcoming">Upcoming</option>
                                                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                    <ChevronDown size={14} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sort */}
                                        <div className="space-y-3 flex-1">
                                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Sort By</span>
                                            <div className="relative">
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => updateUrl({ sortBy: e.target.value })}
                                                    className="w-full appearance-none bg-gray-50 border border-black/10 text-gray-700 text-sm rounded-xl focus:ring-accent focus:border-accent block p-2.5 cursor-pointer hover:bg-black/5 transition-colors"
                                                >
                                                    <option value="popularity.desc">Most Popular</option>
                                                    <option value="vote_average.desc">Top Rated</option>
                                                    <option value="primary_release_date.desc">Newest First</option>
                                                    <option value="primary_release_date.asc">Oldest First</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                    <ChevronDown size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Runtime */}
                                    <div className="space-y-3">
                                        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Runtime</span>
                                        <div className="flex bg-gray-100 p-1 rounded-xl">
                                            {['all', 'short', 'medium', 'long'].map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => updateUrl({ runtime: r as any })}
                                                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${selectedRuntime === r ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    {r === 'all' ? 'Any' : r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rating & Content aligned */}
                                    <div className="flex gap-4 items-end">
                                        <div className="space-y-3 flex-1">
                                            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Min Rating: {minRating > 0 ? minRating + "+" : "Any"}</span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="9"
                                                step="1"
                                                value={minRating}
                                                onChange={(e) => updateUrl({ minRating: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <button
                                                onClick={() => updateUrl({ includeAdult: !includeAdult })}
                                                className={`
                                            flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-300 h-[38px]
                                            ${includeAdult
                                                        ? 'bg-rose-500 text-white border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                                                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-600'}
                                        `}
                                                title="Include Adult Content"
                                            >
                                                <span>18+</span>
                                                <div className={`w-2 h-2 rounded-full ${includeAdult ? 'bg-white' : 'bg-gray-300'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
