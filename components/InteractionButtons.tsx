"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { Heart, Eye, BookOpen, Check, ThumbsDown } from "lucide-react";
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
        dislikedMovies,
        toggleDislike
    } = useMovieStore();

    const isLiked = likedMovies.includes(movie.id);
    const isWatched = watchedMovies.includes(movie.id);
    const isWatchlisted = watchlistMovies.includes(movie.id);
    const isDisliked = dislikedMovies.includes(movie.id);

    // Client-side only rendering to prevent hydration mismatch
    // We already handle this in store persistence but let's be safe visually if needed.
    // For buttons, hydration mismatch usually affects className/text.
    // We'll rely on Zustand's persist which hydrates on mount, but to avoid flash,
    // we can use a small 'mounted' check if needed. 
    // However, given these are interaction buttons, a slight flash is better than no buttons.
    // Let's keep it simple first.

    return (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* LIKED / FAVORITE */}
            <button
                onClick={() => toggleLike(movie.id)}
                className={`group flex items-center justify-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 min-h-[48px] ${isLiked
                    ? "bg-rose-500/20 border-rose-500/50 text-rose-500"
                    : "bg-gray-100 border-gray-200 text-black hover:bg-gray-200"
                    }`}
                title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
            >
                <Heart
                    size={18}
                    className={`transition-transform duration-300 ${isLiked ? "scale-110 fill-current" : "group-hover:scale-110"}`}
                    fill={isLiked ? "currentColor" : "none"}
                />
                <span className="font-medium text-sm">{isLiked ? "Liked" : "Like"}</span>
            </button>

            {/* WATCHLIST */}
            <button
                onClick={() => toggleWatchlist(movie.id)}
                className={`group flex items-center justify-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 min-h-[48px] ${isWatchlisted
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                    : "bg-gray-100 border-gray-200 text-black hover:bg-gray-200"
                    }`}
                title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            >
                <BookOpen size={18} className={isWatchlisted ? "fill-current" : ""} fill={isWatchlisted ? "currentColor" : "none"} />
                <span className="font-medium text-sm">{isWatchlisted ? "Saved" : "Watchlist"}</span>
            </button>

            {/* WATCHED */}
            <button
                onClick={() => toggleWatched(movie.id)}
                className={`group flex items-center justify-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 min-h-[48px] ${isWatched
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                    : "bg-gray-100 border-gray-200 text-black hover:bg-gray-200"
                    }`}
                title={isWatched ? "Mark as Unwatched" : "Mark as Watched"}
            >
                {isWatched ? <Check size={18} /> : <Eye size={18} />}
                <span className="font-medium text-sm">{isWatched ? "Watched" : "Seen"}</span>
            </button>

            {/* DISLIKE (Icon Only) */}
            <button
                onClick={() => toggleDislike(movie.id)}
                className={`group flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 min-h-[48px] ${isDisliked
                    ? "bg-red-500/20 border-red-500/50 text-red-500"
                    : "bg-gray-100 border-gray-200 text-black hover:bg-gray-200"
                    }`}
                title={isDisliked ? "Remove Dislike" : "Dislike/Hide"}
            >
                <ThumbsDown
                    size={18}
                    className={`transition-transform duration-300 ${isDisliked ? "scale-110 fill-current" : "group-hover:scale-110"}`}
                    fill={isDisliked ? "currentColor" : "none"}
                />
            </button>
        </div>
    );
}
