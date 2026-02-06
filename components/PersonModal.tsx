"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { X, Calendar, MapPin, Film, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { fetchPersonDetails, fetchPersonMovieCredits } from "@/lib/tmdb";
import { PersonPhotosModal } from "./PersonPhotosModal";
import { type Person, type CastCredit, type Movie } from "@/lib/constants";

export function PersonModal() {
    const { activePerson, setActivePerson, setActiveMovie } = useMovieStore();
    const [details, setDetails] = useState<Person | null>(null);
    const [credits, setCredits] = useState<CastCredit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (activePerson) {
            setIsLoading(true);
            Promise.all([
                fetchPersonDetails(activePerson.id),
                fetchPersonMovieCredits(activePerson.id)
            ]).then(([d, c]) => {
                console.log("[PersonModal] Fetched Details:", d);
                console.log("[PersonModal] Images:", d?.images);
                setDetails(d);
                setCredits(c);
                setIsLoading(false);
            });
        }
    }, [activePerson]);

    if (!activePerson) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActivePerson(null)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col md:flex-row border border-white/10"
                >
                    <button
                        onClick={() => setActivePerson(null)}
                        className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white hover:text-black rounded-full text-white transition-all"
                    >
                        <X size={20} />
                    </button>

                    {/* Left: Image & Quick Info */}
                    <div className="w-full md:w-1/3 relative bg-black">
                        <div className="relative h-[400px] md:h-full w-full">
                            {(details?.profile_path || activePerson.profile_path) ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w780${details?.profile_path || activePerson.profile_path}`}
                                    alt={activePerson.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700">
                                    <span className="text-4xl">?</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:hidden">
                            <h2 className="text-3xl font-bold text-white mb-2">{activePerson.name}</h2>
                        </div>
                    </div>

                    {/* Right: Content */}
                    <div className="w-full md:w-2/3 p-6 md:p-10 text-white overflow-y-auto custom-scrollbar">
                        <h2 className="text-4xl font-bold mb-4 hidden md:block">{activePerson.name}</h2>

                        {isLoading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                                <div className="h-4 bg-white/10 rounded w-full"></div>
                                <div className="grid grid-cols-3 gap-4 mt-8">
                                    <div className="aspect-[2/3] bg-white/10 rounded"></div>
                                    <div className="aspect-[2/3] bg-white/10 rounded"></div>
                                    <div className="aspect-[2/3] bg-white/10 rounded"></div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Bio */}
                                {details?.biography && (
                                    <div className="mb-8 text-gray-300 leading-relaxed text-sm md:text-base border-l-2 border-indigo-500 pl-4">
                                        {details.biography.length > 500 ? details.biography.slice(0, 500) + "..." : details.biography}
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-400">
                                    {details?.birthday && (
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-indigo-400" />
                                            <span>Born: {details.birthday}</span>
                                        </div>
                                    )}
                                    {details?.place_of_birth && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-indigo-400" />
                                            <span>{details.place_of_birth}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Film size={16} className="text-indigo-400" />
                                        <span>{credits.length} Credits</span>
                                    </div>

                                    {/* Photos Button */}
                                    {details && <PersonPhotosModal photos={details.images?.profiles || []} name={details.name} />}
                                </div>

                                {/* Known For (Roles) */}
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Star size={18} className="text-yellow-400" />
                                    Filmography
                                </h3>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {credits.slice(0, 20).map(credit => (
                                        <button
                                            key={credit.id}
                                            onClick={() => {
                                                // Close Person Modal and Open Movie Modal?
                                                // Or better: Open Movie Modal on top? 
                                                // For simplicity: Swift switch.
                                                setActivePerson(null);
                                                // Construct a partial Movie object safely
                                                const partialMovie: Movie = {
                                                    id: credit.id,
                                                    title: credit.title,
                                                    poster_path: credit.poster_path,
                                                    backdrop_path: "", // Missing
                                                    overview: "", // Missing, will fetch in modal
                                                    release_date: credit.release_date,
                                                    vote_average: credit.vote_average,
                                                    genre_ids: [],
                                                    adult: false,
                                                    original_language: 'en'
                                                };
                                                setActiveMovie(partialMovie);
                                            }}
                                            className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 hover:ring-2 hover:ring-indigo-500 transition-all"
                                        >
                                            {credit.poster_path ? (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w342${credit.poster_path}`}
                                                    alt={credit.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-xs text-gray-500">
                                                    <Film className="mb-2 opacity-50" />
                                                    {credit.title}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-left">
                                                <p className="text-white font-bold text-xs line-clamp-2">{credit.title}</p>
                                                <p className="text-gray-400 text-[10px] mt-0.5">as {credit.character || "Unknown"}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
