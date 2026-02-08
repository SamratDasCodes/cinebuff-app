"use client";

import { fetchMovieDetails } from "@/lib/tmdb";
import { Movie } from "@/lib/constants";
import { GlassCard } from "./ui/GlassCard";
import Image from "next/image";
import { Play, Eye, EyeOff, Info, Check, Bookmark, Heart } from "lucide-react";
import { useState, memo } from "react";
import { MicroButton } from "./ui/MicroButton";
import { useMovieStore } from "@/store/useMovieStore";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface MovieCardProps {
    movie: Movie;
    onClick?: () => void;
}

export const MovieCard = memo(function MovieCard({ movie, onClick }: MovieCardProps) {
    // ... implementations
    const { sensitiveMode, likedMovies, toggleLike, watchedMovies, toggleWatched, watchlistMovies, toggleWatchlist } = useMovieStore();
    const [isHovered, setIsHovered] = useState(false);
    // console.log(`[MovieCard] ${movie.title} Adult:`, movie.adult); 

    // Heuristic: Check title for explicit keywords if adult flag is missing
    const isExplicitTitle = /hentai|sex|erotic|uncensored|nude|adulteress|incest|taboo/i.test(movie.title || "");
    const shouldBlur = Boolean(movie.adult) || sensitiveMode || isExplicitTitle;

    const [blurred, setBlurred] = useState(shouldBlur);
    const [loadingTrailer, setLoadingTrailer] = useState(false);

    const toggleBlur = (e: React.MouseEvent) => {
        e.stopPropagation();
        setBlurred(!blurred);
    };

    const router = useRouter();

    const handleNavigation = () => {
        if (onClick) {
            onClick();
        } else {
            // Robust check: Trust media_type first, fallback to existence of 'name' (TV specific)
            const isTv = movie.media_type === 'tv' || !!movie.name;
            const route = isTv ? 'showdetails' : 'moviedetails';
            router.push(`/${route}/${movie.id}`);
        }
    };

    const handleTrailerClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoadingTrailer(true);
        try {
            // Fetch details to get the trailer key
            const details = await fetchMovieDetails(movie.id);
            const trailer = details?.videos?.results?.find((v: any) => v.type === "Trailer" || v.type === "Teaser");

            const url = trailer
                ? `https://www.youtube.com/watch?v=${trailer.key}`
                : `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`;

            window.open(url, '_blank');
        } catch (err) {
            // Fallback
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`, '_blank');
        } finally {
            setLoadingTrailer(false);
        }
    };

    const imageUrl = `https://image.tmdb.org/t/p/w342${movie.poster_path}`;

    return (
        <GlassCard
            className="relative aspect-[2/3] overflow-hidden group cursor-pointer"
            hoverEffect={true}
            onClick={handleNavigation}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.05 }}
        >
            <div className={`relative w-full h-full transition-all duration-500 ${blurred ? "blur-xl scale-110" : "blur-0"}`}>
                {movie.poster_path ? (
                    <Image
                        src={imageUrl}
                        alt={movie.title || movie.name || "Movie Poster"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
                        No Image
                    </div>
                )}
            </div>

            <div className="absolute top-2 right-2 z-20 flex flex-col gap-2 items-end">
                {/* New Release Indicator */}
                {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const releaseDate = movie.release_date;
                    if (releaseDate === today) {
                        return (
                            <div className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.6)] animate-pulse border border-yellow-200 flex items-center gap-1">
                                ★ New
                            </div>
                        );
                    }
                    return null;
                })()}

                {movie.adult && (
                    <div className="bg-rose-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md shadow-lg border border-white/20">
                        18+
                    </div>
                )}
                <button
                    onClick={toggleBlur}
                    className="p-1.5 rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
                >
                    {blurred ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
            </div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hidden md:flex absolute inset-0 z-10 flex-col items-center justify-center bg-white/90 backdrop-blur-[2px] p-4 text-center gap-3"
                    >
                        <h3 className="text-lg font-bold text-black leading-tight line-clamp-2">{movie.title}</h3>

                        <div className="flex gap-2 mt-2">
                            {/* Trailer Button */}
                            <MicroButton
                                variant="primary"
                                className="gap-2"
                                onClick={handleTrailerClick}
                            >
                                {loadingTrailer ? (
                                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Play size={12} fill="currentColor" />
                                )}
                                Trailer
                            </MicroButton>

                            {/* Info Button */}
                            <MicroButton
                                variant="secondary"
                                className="gap-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigation();
                                }}
                            >
                                <Info size={12} /> Info
                            </MicroButton>
                        </div>

                        {/* Release Date */}
                        <div className="text-sm font-bold text-gray-800 mt-2">
                            {movie.release_date ? new Date(movie.release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Release Date'}
                        </div>

                        <div className="text-xs text-green-400 font-medium mt-1">
                            {Math.round(movie.vote_average * 10)}% Match
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard >
    );
});
