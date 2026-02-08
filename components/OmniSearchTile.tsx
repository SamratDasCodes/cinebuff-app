"use client";

import { MultiSearchResult } from "@/lib/tmdb";
import { useMovieStore } from "@/store/useMovieStore";
import { Star, User, Film, Tv, Check, Plus, ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface OmniSearchTileProps {
    item: MultiSearchResult & { score?: number };
    isSelected: boolean;
    onSelect: (item: MultiSearchResult) => void;
    onMouseEnter: () => void;
}

export function OmniSearchTile({ item, isSelected, onSelect, onMouseEnter }: OmniSearchTileProps) {
    const { watchlistMovies, toggleWatchlist, watchedMovies, toggleWatched } = useMovieStore();

    const isWatchlisted = watchlistMovies.includes(item.id);
    const isWatched = watchedMovies.includes(item.id);

    // Stops propagation so clicking the button doesn't trigger selection
    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    const imageUrl = item.poster_path || item.profile_path
        ? `https://image.tmdb.org/t/p/w342${item.poster_path || item.profile_path}`
        : null;

    return (
        <motion.div
            layout // Helper for smooth grid re-layouts
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            className={`
                group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer
                bg-gray-900 border border-white/10 shadow-lg
                ${isSelected ? 'ring-2 ring-indigo-500' : 'hover:ring-1 hover:ring-white/30'}
                transition-all duration-300
            `}
            onClick={() => onSelect(item)}
            onMouseEnter={onMouseEnter}
        >
            {/* Image */}
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={item.title || item.name || "Result"}
                    fill
                    className={`object-cover transition-transform duration-500 group-hover:scale-110 ${item.adult ? 'blur-md grayscale' : ''}`}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-800 gap-2">
                    {item.media_type === 'person' ? <User size={40} /> : item.media_type === 'tv' ? <Tv size={40} /> : <Film size={40} />}
                    <span className="text-xs font-medium uppercase tracking-widest text-gray-500">No Image</span>
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Content Content (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">

                {/* Type Badge & Rating */}
                <div className="flex items-center justify-between mb-1 opacity-80 text-[10px] font-bold uppercase tracking-wider text-gray-300">
                    <span className={`
                        px-1.5 py-0.5 rounded-sm
                        ${item.media_type === 'movie' ? 'bg-indigo-500/20 text-indigo-300' :
                            item.media_type === 'tv' ? 'bg-orange-500/20 text-orange-300' : 'bg-emerald-500/20 text-emerald-300'}
                    `}>
                        {item.media_type}
                    </span>
                    {item.vote_average && item.vote_average > 0 && (
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star size={10} fill="currentColor" />
                            <span>{item.vote_average.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-white font-bold leading-tight line-clamp-2 text-sm md:text-base drop-shadow-md">
                    {item.title || item.name}
                </h3>

                {/* Date */}
                {/* Date */}
                {item.release_date && (
                    <p className="text-gray-400 text-xs mt-1 font-medium">
                        {item.release_date.split('-')[0]}
                    </p>
                )}

                {/* Hover Actions */}
                <div className={`
                    flex items-center gap-2 mt-3 pt-3 border-t border-white/10
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75
                `}>
                    {item.media_type !== 'person' && (
                        <>
                            <button
                                onClick={(e) => handleAction(e, () => toggleWatchlist(item.id))}
                                className={`p-1.5 rounded-full ${isWatchlisted ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                title="Watchlist"
                            >
                                {isWatchlisted ? <Check size={14} /> : <Plus size={14} />}
                            </button>

                            {/* We could add Watched toggle here too, but let's keep it minimal for search tiles */}
                        </>
                    )}

                    <div className="ml-auto text-xs font-bold text-white/50 group-hover:text-white flex items-center gap-1">
                        Open <ArrowRight size={12} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
