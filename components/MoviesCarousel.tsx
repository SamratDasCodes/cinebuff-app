"use client";

import { Movie } from "@/lib/tmdb";
import { MovieCard } from "./MovieCard";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface MoviesCarouselProps {
    title: string;
    movies: Movie[];
}

export function MoviesCarousel({ title, movies }: MoviesCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth / 2 : current.offsetWidth / 2;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (!movies || movies.length === 0) return null;

    return (
        <div className="w-full space-y-4 py-8">
            <div className="flex items-center justify-between px-4">
                <h2 className="text-xl md:text-2xl font-bold text-black flex items-center gap-3">
                    <span className="w-1 h-6 bg-black rounded-full" />
                    {title}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-black transition-colors"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-black/5 hover:bg-black/10 text-black transition-colors"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto px-4 pb-8 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {movies.map((movie) => (
                    <div key={movie.id} className="min-w-[160px] md:min-w-[200px] snap-start">
                        <MovieCard
                            movie={movie}
                            onClick={() => router.push(`/moviedetails/${movie.id}`)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
