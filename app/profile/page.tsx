"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { BackButton } from "@/components/BackButton";
import { Settings, Heart, Eye, User, Film, BookOpen, ShieldAlert, Edit2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/lib/tmdb";
import { Movie } from "@/lib/constants";

export default function ProfilePage() {
    const {
        userId,
        userName,
        setUserName,
        likedMovies,
        watchedMovies,
        includeAdult,
        toggleIncludeAdult,
    } = useMovieStore();

    // Local state for fetched movies (limited preview)
    const [likedPreviews, setLikedPreviews] = useState<Movie[]>([]);
    const [watchedPreviews, setWatchedPreviews] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");

    // Initialize temp name
    useEffect(() => {
        setTempName(userName);
    }, [userName]);

    const handleSaveName = () => {
        if (tempName.trim()) {
            setUserName(tempName.trim());
            setIsEditingName(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        async function loadPreviews() {
            setLoading(true);
            try {
                // Fetch last 4 liked
                const recentLikedIds = [...likedMovies].reverse().slice(0, 4);
                const recentWatchedIds = [...watchedMovies].reverse().slice(0, 4);

                const [likedData, watchedData] = await Promise.all([
                    Promise.all(recentLikedIds.map(id => fetchMovieDetails(id))),
                    Promise.all(recentWatchedIds.map(id => fetchMovieDetails(id)))
                ]);

                if (isMounted) {
                    setLikedPreviews(likedData.filter(m => m !== null) as Movie[]);
                    setWatchedPreviews(watchedData.filter(m => m !== null) as Movie[]);
                }
            } catch (e) {
                console.error("Failed to load profile previews", e);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadPreviews();
        return () => { isMounted = false; };
    }, [likedMovies, watchedMovies]);

    return (
        <main className="min-h-screen bg-[#fafafa] text-black">
            {/* Back Button */}
            <div className="fixed top-6 left-6 z-50">
                <BackButton />
            </div>

            <div className="container mx-auto px-6 pt-24 pb-12 max-w-5xl">

                {/* Header Profile Card */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full -mr-12 -mt-12" />

                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full bg-black text-white flex items-center justify-center shadow-2xl relative z-10 shrink-0">
                        <User size={64} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left z-10 space-y-2 w-full">
                        {isEditingName ? (
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="text-4xl font-bold tracking-tight bg-gray-50 border-b-2 border-black focus:outline-none w-full max-w-md"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                />
                                <button onClick={handleSaveName} className="px-4 py-2 bg-black text-white rounded-full text-sm font-bold">Save</button>
                            </div>
                        ) : (
                            <div className="group flex items-center gap-3 justify-center md:justify-start">
                                <h1
                                    className="text-4xl font-bold tracking-tight cursor-pointer hover:underline decoration-dashed underline-offset-4"
                                    onClick={() => setIsEditingName(true)}
                                    title="Click to edit name"
                                >
                                    {userName}
                                </h1>
                                <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-xs font-mono bg-gray-50 w-fit mx-auto md:mx-0 px-2 py-1 rounded border border-gray-100" title="Your Unique Device ID">
                            <span>ID: {userId}</span>
                        </div>
                        <p className="text-gray-500 font-medium pt-2">Welcome back to your personal space.</p>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
                            <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                                <Heart size={16} className="text-rose-500" fill="currentColor" />
                                <span className="font-bold text-lg">{likedMovies.length}</span>
                                <span className="text-xs uppercase font-bold text-gray-400">Liked</span>
                            </div>
                            <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                                <Eye size={16} className="text-indigo-500" />
                                <span className="font-bold text-lg">{watchedMovies.length}</span>
                                <span className="text-xs uppercase font-bold text-gray-400">Watched</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <Settings size={24} /> Settings
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Adult Toggle */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-black/10 transition-colors">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 font-bold text-lg">
                                    <ShieldAlert size={20} className={includeAdult ? "text-rose-500" : "text-gray-400"} />
                                    Adult Content
                                </div>
                                <p className="text-sm text-gray-500">Show 18+ content in search results.</p>
                            </div>
                            <button
                                onClick={toggleIncludeAdult}
                                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${includeAdult ? 'bg-rose-500' : 'bg-gray-200'}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ${includeAdult ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Liked Movies Preview */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Heart className="text-rose-500" fill="currentColor" size={24} /> Favorites
                        </h2>
                    </div>

                    {likedMovies.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400 mb-4">No favorites yet.</p>
                            <Link href="/home" className="text-indigo-600 font-bold hover:underline">Explore Movies</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {likedPreviews.map(movie => (
                                <Link href={`/${movie.media_type === 'tv' ? 'showdetails' : 'moviedetails'}/${movie.id}`} key={movie.id} className="group block">
                                    <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-gray-100 mb-2">
                                        {movie.poster_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                alt={movie.title || movie.name || "Untitled"}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                    <h3 className="font-bold text-sm truncate group-hover:text-indigo-600 transition-colors">{movie.title || movie.name}</h3>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Watched Movies Preview */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <ExperienceIcon /> Watched History
                        </h2>
                    </div>

                    {watchedMovies.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-400 mb-4">You haven't marked any movies as watched.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {watchedPreviews.map(movie => (
                                <Link href={`/${movie.media_type === 'tv' ? 'showdetails' : 'moviedetails'}/${movie.id}`} key={movie.id} className="group block">
                                    <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-gray-100 mb-2 grayscale group-hover:grayscale-0 transition-all duration-500">
                                        {movie.poster_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                                alt={movie.title || movie.name || "Untitled"}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">No Image</div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-sm truncate text-gray-500 group-hover:text-black transition-colors">{movie.title || movie.name}</h3>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}

function ExperienceIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
    )
}
