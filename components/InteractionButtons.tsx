"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { Heart, Eye, BookOpen, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Movie } from "@/lib/constants";

interface InteractionButtonsProps {
    movie: Movie;
}

export function InteractionButtons({ movie }: InteractionButtonsProps) {
    const {
        likedMovies,
        toggleLike,
        watchedMovies,
        toggleWatched,
        watchlistMovies,
        toggleWatchlist,
    } = useMovieStore();

    const isLiked = likedMovies.includes(movie.id);
    const isWatched = watchedMovies.includes(movie.id);
    const isWatchlisted = watchlistMovies.includes(movie.id);

    // Client-side only rendering to prevent hydration mismatch
    // We already handle this in store persistence but let's be safe visually if needed.
    // For buttons, hydration mismatch usually affects className/text.
    // We'll rely on Zustand's persist which hydrates on mount, but to avoid flash,
    // we can use a small 'mounted' check if needed. 
    // However, given these are interaction buttons, a slight flash is better than no buttons.
    // Let's keep it simple first.

    return (
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            {/* LIKED / FAVORITE */}
            <button
                onClick={() => toggleLike(movie.id)}
                className={`group flex items-center justify-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 ${isLiked
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black"
                    }`}
                title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
            >
                <Heart
                    size={20}
                    className={`transition-transform duration-300 ${isLiked ? "scale-110 fill-current" : "group-hover:scale-110"}`}
                    fill={isLiked ? "currentColor" : "none"}
                />
                <span className="font-semibold">{isLiked ? "Liked" : "Like"}</span>
            </button>

            {/* WATCHLIST */}
            <button
                onClick={() => toggleWatchlist(movie.id)}
                className={`group flex items-center justify-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 ${isWatchlisted
                        ? "bg-blue-50 border-blue-200 text-blue-600"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black"
                    }`}
                title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            >
                <BookOpen size={20} className={isWatchlisted ? "fill-current" : ""} fill={isWatchlisted ? "currentColor" : "none"} />
                <span className="font-semibold">{isWatchlisted ? "Saved" : "Watchlist"}</span>
            </button>

            {/* WATCHED */}
            <button
                onClick={() => toggleWatched(movie.id)}
                className={`group flex items-center justify-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 ${isWatched
                        ? "bg-green-50 border-green-200 text-green-600"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black"
                    }`}
                title={isWatched ? "Mark as Unwatched" : "Mark as Watched"}
            >
                {isWatched ? <Check size={20} /> : <Eye size={20} />}
                <span className="font-semibold">{isWatched ? "Watched" : "Seen"}</span>
            </button>
        </div>
    );
}
