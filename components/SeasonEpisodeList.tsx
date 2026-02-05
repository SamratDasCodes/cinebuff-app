"use client";

import { useState, useEffect } from "react";
import { fetchTvSeason } from "@/lib/tmdb";
import Image from "next/image";
import { Calendar, Clock, ChevronDown } from "lucide-react";

interface Season {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path?: string;
}

interface Episode {
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    air_date: string;
    still_path?: string;
    runtime?: number;
    vote_average?: number;
}

interface SeasonEpisodeListProps {
    tvId: number;
    seasons: Season[];
}

export function SeasonEpisodeList({ tvId, seasons }: SeasonEpisodeListProps) {
    // Filter out season 0 (Specials) usually, unless wanted. 
    // Usually people want strict seasons first. Let's keep all but sort by season_number.
    const sortedSeasons = [...seasons].sort((a, b) => a.season_number - b.season_number);

    // Default to first season (usually Season 1)
    const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(
        sortedSeasons.find(s => s.season_number === 1)?.season_number || sortedSeasons[0]?.season_number || 1
    );

    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadEpisodes() {
            setLoading(true);
            try {
                const data = await fetchTvSeason(tvId, selectedSeasonNumber);
                if (isMounted && data && data.episodes) {
                    setEpisodes(data.episodes);
                }
            } catch (error) {
                console.error("Failed to load episodes", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadEpisodes();

        return () => { isMounted = false; };
    }, [tvId, selectedSeasonNumber]);

    return (
        <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-black">
                <span className="w-1 h-8 bg-black rounded-full" />
                Seasons & Episodes
            </h2>

            {/* Season Selector */}
            <div className="mb-8">
                <div className="flex flex-wrap gap-3">
                    {sortedSeasons.map((season) => (
                        <button
                            key={season.id}
                            onClick={() => setSelectedSeasonNumber(season.season_number)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-bold transition-all border
                                ${selectedSeasonNumber === season.season_number
                                    ? 'bg-black text-white border-black shadow-lg scale-105'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:text-black hover:scale-105'
                                }
                            `}
                        >
                            {season.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Episodes List */}
            <div className="space-y-4">
                {loading ? (
                    // Skeleton Loading
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 h-32 animate-pulse" />
                    ))
                ) : episodes.length > 0 ? (
                    episodes.map((episode) => (
                        <div
                            key={episode.id}
                            className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 relative overflow-hidden group"
                        >
                            {/* Episode Image */}
                            <div className="shrink-0 w-full md:w-48 aspect-video relative rounded-xl overflow-hidden bg-gray-100">
                                {episode.still_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${episode.still_path}`}
                                        alt={episode.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-gray-300">
                                        <div className="w-8 h-8 rounded-full border-2 border-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                                    EP {episode.episode_number}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-2">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                    <h3 className="text-lg font-bold text-black group-hover:text-indigo-600 transition-colors">
                                        {episode.name}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {episode.air_date}
                                        </div>
                                        {episode.runtime && (
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {episode.runtime}m
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 md:line-clamp-none">
                                    {episode.overview || "No description available."}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        No episodes found for this season.
                    </div>
                )}
            </div>
        </section>
    );
}
