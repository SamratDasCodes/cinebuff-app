"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { BackButton } from "@/components/BackButton";
import { Settings, Heart, Eye, User, Film, BookOpen, ShieldAlert, Edit2, LogOut, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMovieDetails } from "@/lib/tmdb";
import { Movie } from "@/lib/constants";
import { MovieGrid } from "@/components/MovieGrid"; // Import Grid
import { motion } from "framer-motion";

import { useRouter } from "next/navigation"; // Import router

export default function ProfilePage() {
    const router = useRouter(); // Initialize router
    const {
        userId,
        userName,
        setUserName,
        likedMovies,
        watchedMovies,
        watchlistMovies,
        dislikedMovies,
        includeAdult,
        toggleIncludeAdult,
        defaultMediaMode,
        setDefaultMediaMode,
        defaultSortBy,
        setDefaultSortBy,
        defaultLanguages,
        setDefaultLanguages
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

    // Recommendations State
    const [recommendations, setRecommendations] = useState<Movie[]>([]);
    const [recLoading, setRecLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadPreviews() {
            setLoading(true);
            try {
                // Fetch last 4 liked & watched for preview
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

        async function loadRecommendations() {
            // Allow Cold Start (Engine handles empty lists by returning Trending)

            setRecLoading(true);
            try {
                // Dynamic import to avoid server-side issues if any
                console.log("🎬 Generating Personalized Feed...", { liked: likedMovies.length, watched: watchedMovies.length, disliked: dislikedMovies.length });
                const { generatePersonalizedFeed } = await import("@/lib/RecommendationEngine");
                const recs = await generatePersonalizedFeed(likedMovies, watchlistMovies, watchedMovies, dislikedMovies);
                console.log("✨ Recommendations Generated:", recs.length, recs);
                if (isMounted) setRecommendations(recs.slice(0, 10)); // Top 10
            } catch (e) {
                console.error("Rec Engine Error:", e);
            } finally {
                if (isMounted) setRecLoading(false);
            }
        }

        loadPreviews();
        loadRecommendations();

        return () => { isMounted = false; };
    }, [likedMovies, watchedMovies, watchlistMovies]);

    // Library View State
    const [libraryMode, setLibraryMode] = useState<'favorites' | 'watchlist' | 'watched' | 'recommended' | 'settings'>('favorites');
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    return (
        <main className="min-h-screen bg-[#fafafa] text-black">
            {/* Back Button */}
            <div className="fixed top-6 left-6 z-50">
                <BackButton />
            </div>

            <div className="container mx-auto px-6 pt-24 pb-32 max-w-7xl">

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
                            <span>ID: {hasMounted ? userId : "..."}</span>
                        </div>
                        <p className="text-gray-500 font-medium pt-2">Welcome back to your personal space.</p>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
                            <button onClick={() => setLibraryMode('settings')} className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${libraryMode === 'settings' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                <Settings size={16} className={libraryMode === 'settings' ? "text-white" : "text-gray-400"} />
                                <span className="text-xs uppercase font-bold opacity-70">Settings</span>
                            </button>
                            <button onClick={() => setLibraryMode('favorites')} className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${libraryMode === 'favorites' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                <Heart size={16} className={libraryMode === 'favorites' ? "text-rose-500" : "text-gray-400"} fill={libraryMode === 'favorites' ? "currentColor" : "none"} />
                                <span className="font-bold text-lg">{hasMounted ? likedMovies.length : 0}</span>
                                <span className="text-xs uppercase font-bold opacity-70">Liked</span>
                            </button>
                            <button onClick={() => setLibraryMode('watchlist')} className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${libraryMode === 'watchlist' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                <BookOpen size={16} className={libraryMode === 'watchlist' ? "text-blue-500" : "text-gray-400"} />
                                <span className="font-bold text-lg">{hasMounted ? watchlistMovies.length : 0}</span>
                                <span className="text-xs uppercase font-bold opacity-70">Watchlist</span>
                            </button>
                            <button onClick={() => setLibraryMode('watched')} className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${libraryMode === 'watched' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                <Eye size={16} className={libraryMode === 'watched' ? "text-green-500" : "text-gray-400"} />
                                <span className="font-bold text-lg">{hasMounted ? watchedMovies.length : 0}</span>
                                <span className="text-xs uppercase font-bold opacity-70">Watched</span>
                            </button>
                            <button onClick={() => setLibraryMode('recommended')} className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${libraryMode === 'recommended' ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                <Sparkles size={16} className={libraryMode === 'recommended' ? "text-purple-500" : "text-gray-400"} />
                                <span className="font-bold text-lg">{recommendations.length}</span>
                                <span className="text-xs uppercase font-bold opacity-70">For You</span>
                            </button>
                        </div>
                    </div>
                </div>



                {/* Content Area */}
                <div>
                    {libraryMode === 'settings' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* General Settings */}
                            <div>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-400">
                                    <ShieldAlert size={20} /> Content Safety
                                </h2>
                                <div className="space-y-4">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 font-bold text-lg">
                                                Include Adult Content
                                            </div>
                                            <p className="text-sm text-gray-500">Enable 18+ content in results.</p>
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

                            {/* Defaults / Preferences */}
                            <div>
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-400">
                                    <Settings size={20} /> Preferences
                                </h2>
                                <div className="space-y-4">
                                    {/* Default Mode */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="font-bold text-lg">Default Mode</div>
                                            <p className="text-sm text-gray-500">Start the app in this mode.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {[
                                                { id: 'movie', label: 'Movies' },
                                                { id: 'tv', label: 'TV' }
                                            ].map((mode) => (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => {
                                                        setDefaultMediaMode(mode.id as any);
                                                        router.refresh(); // Force server re-fetch
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${defaultMediaMode === mode.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                >
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Default Sort */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="font-bold text-lg">Default Sort</div>
                                            <p className="text-sm text-gray-500">Preferred sorting method.</p>
                                        </div>
                                        <select
                                            value={defaultSortBy}
                                            onChange={(e) => {
                                                setDefaultSortBy(e.target.value);
                                                router.refresh();
                                            }}
                                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-black"
                                        >
                                            <option value="popularity.desc">Popular</option>
                                            <option value="primary_release_date.desc">Newest</option>
                                            <option value="vote_average.desc">Top Rated</option>
                                            <option value="revenue.desc">Revenue</option>
                                        </select>
                                    </div>

                                    {/* Default Languages */}
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full">
                                        <div className="mb-4">
                                            <div className="font-bold text-lg">Default Languages</div>
                                            <p className="text-sm text-gray-500">Content enabled by default.</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { code: 'en', name: 'English' },
                                                { code: 'bn', name: 'Bengali' },
                                                { code: 'hi', name: 'Hindi' },
                                                { code: 'es', name: 'Spanish' },
                                                { code: 'fr', name: 'French' },
                                                { code: 'ja', name: 'Japanese' },
                                                { code: 'ko', name: 'Korean' }
                                            ].map((lang) => {
                                                const isSelected = defaultLanguages.includes(lang.code);
                                                return (
                                                    <button
                                                        key={lang.code}
                                                        onClick={() => {
                                                            const newLangs = isSelected
                                                                ? defaultLanguages.filter(l => l !== lang.code)
                                                                : [...defaultLanguages, lang.code];
                                                            setDefaultLanguages(newLangs.length ? newLangs : ['en']); // Prevent empty
                                                            router.refresh();
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${isSelected ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                                                    >
                                                        {lang.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <MovieGrid
                            overrideMode={libraryMode === 'recommended' ? 'custom' : libraryMode as any}
                            customMovies={libraryMode === 'recommended' ? recommendations : undefined}
                        />
                    )}
                </div>

                {/* Account Actions */}
                <div className="mt-8 flex justify-center md:justify-start">
                    <button
                        onClick={async () => {
                            const { signOut } = await import('firebase/auth');
                            const { auth } = await import('@/lib/firebase');
                            if (auth) await signOut(auth);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>
                </div>

            </div>
        </main >
    );
}

function ExperienceIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
    )
}
