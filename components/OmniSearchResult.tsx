"use client";

import { MultiSearchResult } from "@/lib/tmdb";
import { useMovieStore } from "@/store/useMovieStore";
import { ArrowRight, Star, User, Film, Tv, Plus, Check, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface OmniSearchResultProps {
    item: MultiSearchResult & { score?: number };
    isSelected: boolean;
    onSelect: (item: MultiSearchResult) => void;
    onMouseEnter: () => void;
}

export function OmniSearchResult({ item, isSelected, onSelect, onMouseEnter }: OmniSearchResultProps) {
    const { watchlistMovies, toggleWatchlist, watchedMovies, toggleWatched } = useMovieStore();

    const isWatchlisted = watchlistMovies.includes(item.id);
    const isWatched = watchedMovies.includes(item.id);

    // Stop propagation for actions
    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`
                group relative flex items-center gap-4 px-4 py-3 cursor-pointer transition-all duration-200
                ${isSelected ? 'bg-black/5' : 'hover:bg-black/5'}
            `}
            onClick={() => onSelect(item)}
            onMouseEnter={onMouseEnter}
        >
            {/* Poster / Profile */}
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
                        {item.media_type === 'person' ? <User size={18} /> : item.media_type === 'tv' ? <Tv size={18} /> : <Film size={18} />}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                    <h4 className={`text-base font-semibold truncate transition-colors ${isSelected ? 'text-black' : 'text-gray-800'}`}>
                        {item.title || item.name}
                    </h4>
                    {item.adult && (
                        <span className="text-[10px] bg-rose-100 text-rose-600 px-1 rounded border border-rose-200 font-bold">18+</span>
                    )}
                    {isWatched && (
                        <span className="text-[10px] bg-green-100 text-green-600 px-1.5 rounded-full font-bold flex items-center gap-0.5">
                            <Check size={8} /> Seen
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                    {/* Media Badge */}
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

            {/* Quick Actions (Visible on Hover/Select) */}
            <div className={`
                flex items-center gap-2 transition-opacity duration-200
                ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}>
                {item.media_type !== 'person' && (
                    <button
                        onClick={(e) => handleAction(e, () => toggleWatchlist(item.id))}
                        className={`
                            p-2 rounded-full transition-colors
                            ${isWatchlisted
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'}
                        `}
                        title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                        {isWatchlisted ? <Check size={16} /> : <Plus size={16} />}
                    </button>
                )}

                <div className="text-gray-300 pl-1">
                    <ArrowRight size={20} className={`transition-transform duration-200 ${isSelected ? 'translate-x-1 text-indigo-400' : ''}`} />
                </div>
            </div>
        </motion.div>
    );
}
