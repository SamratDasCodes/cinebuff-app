"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, ExternalLink, Heart, Check, Bookmark } from "lucide-react";
import Image from "next/image";
import { MicroButton } from "./ui/MicroButton";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/lib/tmdb";

export function MovieModal() {
    const { activeMovie, setActiveMovie, likedMovies, toggleLike, watchedMovies, toggleWatched, watchlistMovies, toggleWatchlist } = useMovieStore();
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        if (activeMovie) {
            setDetails(null);
            fetchMovieDetails(activeMovie.id).then(setDetails);
        }
    }, [activeMovie]);

    if (!activeMovie) return null;

    const isLiked = likedMovies.includes(activeMovie.id);
    const isWatched = watchedMovies.includes(activeMovie.id);
    const isWatchlisted = watchlistMovies.includes(activeMovie.id);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setActiveMovie(null)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-4xl bg-[#fafafa] border border-black/5 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col md:flex-row text-black"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setActiveMovie(null)}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/10 hover:bg-black/20 text-black transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Backdrop Area */}
                    <div className="md:w-2/5 relative h-64 md:h-auto shrink-0">
                        {activeMovie.poster_path ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/w780${activeMovie.poster_path}`}
                                alt={activeMovie.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent md:bg-gradient-to-r" />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                        <h2 className="text-3xl font-bold tracking-tight mb-2">{activeMovie.title}</h2>
                        <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-500">
                            <span>{activeMovie.release_date?.split('-')[0]}</span>
                            <span>•</span>
                            <span>{activeMovie.vote_average?.toFixed(1)} Rating</span>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-6">
                            {details?.overview || activeMovie.overview || "No overview available."}
                        </p>

                        {/* Dynamic Details */}
                        {details && (
                            <div className="space-y-6">
                                {/* Cast */}
                                {details.credits?.cast?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Cast</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {details.credits.cast.slice(0, 5).map((person: any) => (
                                                <span key={person.id} className="text-sm bg-black/5 border border-black/5 px-3 py-1 rounded-full text-gray-800">
                                                    {person.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-4 pt-4 flex-wrap">
                                    <MicroButton variant="primary" className="gap-2 px-6 py-2.5" onClick={() => {
                                        const trailer = details.videos?.results?.find((v: any) => v.type === "Trailer");
                                        const url = trailer
                                            ? `https://www.youtube.com/watch?v=${trailer.key}`
                                            : `https://www.youtube.com/results?search_query=${encodeURIComponent(activeMovie.title + " trailer")}`;
                                        window.open(url, '_blank');
                                    }}>
                                        <Play size={16} fill="currentColor" /> Play Trailer
                                    </MicroButton>

                                    <MicroButton variant="outline" className="gap-2 px-6 py-2.5" onClick={() => {
                                        const providers = details["watch/providers"]?.results?.US;
                                        if (providers?.link) {
                                            window.open(providers.link, '_blank');
                                        } else {
                                            window.open(`https://www.google.com/search?q=watch ${encodeURIComponent(activeMovie.title)}`, '_blank');
                                        }
                                    }}>
                                        <ExternalLink size={16} /> Where to Watch
                                    </MicroButton>
                                </div>

                                {/* Social Actions - Pills */}
                                <div className="flex gap-2 pt-4 border-t border-black/5">
                                    {/* Watched Pill */}
                                    <button
                                        onClick={() => toggleWatched(activeMovie.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${isWatched
                                            ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            }`}
                                    >
                                        <Check size={18} />
                                        <span>Watched</span>
                                    </button>

                                    {/* Watchlist Pill */}
                                    <button
                                        onClick={() => toggleWatchlist(activeMovie.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${isWatchlisted
                                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            }`}
                                    >
                                        <Bookmark size={18} fill={isWatchlisted ? "currentColor" : "none"} />
                                        <span>Watchlist</span>
                                    </button>

                                    {/* Favourite/Like Pill */}
                                    <button
                                        onClick={() => toggleLike(activeMovie.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all duration-300 ${isLiked
                                            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            }`}
                                    >
                                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                                        <span>Liked</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {!details && (
                            <div className="py-10 flex justify-center">
                                <div className="animate-pulse w-8 h-8 rounded-full bg-black/10"></div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
