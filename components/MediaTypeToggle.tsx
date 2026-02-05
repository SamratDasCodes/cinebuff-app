"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { motion } from "framer-motion";

import Link from "next/link";

export function MediaTypeToggle() {
    const { mediaMode } = useMovieStore();

    const tabs = [
        { id: 'movie', label: 'Movies', path: '/home/movies' },
        { id: 'tv', label: 'Shows', path: '/home/shows' },
        { id: 'anime', label: 'Anime', path: '/home/anime' },
    ] as const;

    return (
        <div className="flex p-1 bg-white border border-black/5 rounded-full relative shadow-sm">
            {tabs.map((tab) => {
                const isActive = mediaMode === tab.id;
                return (
                    <Link
                        key={tab.id}
                        href={tab.path}
                        className={`
                            relative z-10 px-6 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 block
                            ${isActive ? 'text-white' : 'text-gray-500 hover:text-black'}
                        `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeMediaTab"
                                className="absolute inset-0 bg-black rounded-full -z-10 shadow-lg"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
