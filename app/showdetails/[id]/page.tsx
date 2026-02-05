import { fetchMovieDetails } from "@/lib/tmdb";
import { RecommendedMovies } from "@/components/RecommendedMovies";
import { Suspense } from "react";
import Image from "next/image";
import { Calendar, Clock, Star, Play } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { BackButton } from "@/components/BackButton";
import { SeasonEpisodeList } from "@/components/SeasonEpisodeList";

export const revalidate = 3600;

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const movie = await fetchMovieDetails(parseInt(id), 'tv');
    if (!movie) return { title: "Show Not Found" };
    return {
        title: `${movie.name || movie.title} - WhatToWatch`, // TV usually has name
        description: movie.overview,
    };
}

export default async function ShowDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const movieId = parseInt(id);

    // Fetch Details (Strict TV)
    const movie = await fetchMovieDetails(movieId, 'tv');

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-400 mb-8">TV Show not found.</p>
                    <Link href="/" className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const title = movie.name || movie.title;
    const releaseDate = movie.first_air_date || movie.release_date;
    const runtime = (movie.episode_run_time?.length > 0 ? movie.episode_run_time[0] : 0);

    // Logic for Seasons/Episodes display
    const runtimeStr = runtime > 0
        ? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
        : `${movie.number_of_seasons} Seasons`;

    // Extract Certification
    const rating = movie.content_ratings?.results?.find((r: any) => r.iso_3166_1 === 'US')?.rating;
    const certification = rating;


    // Extract Trailer
    const trailer = movie.videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube")
        || movie.videos?.results?.find((v: any) => v.site === "YouTube");

    // Creator
    const director = movie.created_by?.map((c: any) => c.name).join(", ");

    return (

        <main className="min-h-screen bg-[#fafafa] text-black selection:bg-indigo-500/30 relative">

            {/* Back Button */}
            <div className="absolute md:fixed top-6 left-6 z-50">
                <BackButton />
            </div>

            {/* HERO SECTION */}
            <div className="relative w-full min-h-[70vh] lg:min-h-[85vh] flex items-end">
                {/* Backdrop Image */}
                <div className="absolute inset-0 z-0">
                    {movie.backdrop_path ? (
                        <Image
                            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
                            alt={title}
                            fill
                            className="object-cover"
                            priority
                            quality={80}
                        />
                    ) : (
                        <div className="w-full h-full bg-neutral-900" />
                    )}
                    {/* Gradients for text readability - fade to light */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-[#fafafa]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#fafafa]/80 via-transparent to-transparent" />
                </div>

                {/* Content Overlay - Now Relative/In-Flow */}
                <div className="relative z-10 w-full pb-12 pt-32 lg:pb-20">
                    <div className="container mx-auto px-6 flex flex-col md:flex-row gap-8 items-end">

                        {/* Poster (Hidden on mobile, visible on tablet+) */}
                        <div className="hidden md:block w-64 lg:w-80 aspect-[2/3] relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 hover:scale-105 transition-transform duration-500">
                            <Image
                                src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
                                alt={title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 space-y-6 max-w-4xl">

                            {/* Title & Metadata */}
                            <div className="space-y-2">
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black leading-[1.1]">
                                    {title}
                                </h1>
                                {movie.tagline && (
                                    <p className="text-lg md:text-xl text-indigo-600 font-medium italic opacity-90">
                                        "{movie.tagline}"
                                    </p>
                                )}
                            </div>

                            {/* Meta Row */}
                            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-700 font-medium">
                                <div className="flex items-center gap-1.5 text-yellow-500">
                                    <Star size={18} fill="currentColor" />
                                    <span className="text-black font-bold">{movie.vote_average?.toFixed(1)}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={18} />
                                    <span>{releaseDate?.split('-')[0]}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={18} />
                                    <span>{runtimeStr}</span>
                                </div>
                                {certification && (
                                    <>
                                        <span>•</span>
                                        <span className="px-2 py-0.5 border border-black/20 rounded text-xs uppercase">
                                            {certification}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Genres */}
                            <div className="flex flex-wrap gap-2">
                                {movie.genres?.map((g: any) => (
                                    <span key={g.id} className="px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm text-gray-800 hover:bg-gray-50 transition-colors">
                                        {g.name}
                                    </span>
                                ))}
                            </div>

                            {/* Overview */}
                            <p className="text-gray-800 text-lg leading-relaxed line-clamp-4 md:line-clamp-none max-w-3xl">
                                {movie.overview}
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                                {trailer ? (
                                    <a
                                        href={`https://www.youtube.com/watch?v=${trailer.key}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 px-6 py-3.5 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 hover:scale-105 transition-all shadow-lg w-full sm:w-auto"
                                    >
                                        <Play fill="currentColor" size={20} />
                                        Watch Trailer
                                    </a>
                                ) : (
                                    <a
                                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${releaseDate?.split('-')[0] || ''} trailer`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 px-6 py-3.5 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 hover:scale-105 transition-all shadow-lg w-full sm:w-auto"
                                    >
                                        <Play fill="currentColor" size={20} />
                                        Search Trailer
                                    </a>
                                )}
                                {/* Add to Watchlist Button could go here */}

                                {/* OTT Pill (Moved inside buttons container) */}
                                {(() => {
                                    const providers = movie['watch/providers']?.results?.IN;
                                    const watchLink = providers?.link;
                                    const streamers = providers?.flatrate || [];

                                    if (streamers.length === 0) return null;

                                    return (
                                        <a
                                            href={watchLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-4 px-6 py-3.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all group w-full sm:w-auto"
                                            title="Watch Options"
                                        >
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stream on</span>
                                            <div className="h-6 w-px bg-gray-200" />
                                            <div className="flex -space-x-4 group-hover:space-x-1 transition-all">
                                                {streamers.slice(0, 4).map((p: any) => (
                                                    <div key={p.provider_id} className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                                                        <Image
                                                            src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                                                            fill
                                                            alt={p.provider_name}
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ))}
                                                {streamers.length > 4 && (
                                                    <div className="relative w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 z-10">
                                                        +{streamers.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        </a>
                                    );
                                })()}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* DETAILS CONTENT */}
            <div className="container mx-auto px-6 py-16 space-y-16">

                {/* MAIN CONTENT STACK */}
                <div className="space-y-12 max-w-5xl mx-auto">


                    {/* 2. Top Cast (Horizontal Scroll) */}
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* 2. Top Cast (Horizontal Scroll) - Takes Main Space */}
                        <section className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-black">
                                <span className="w-1 h-8 bg-black rounded-full" />
                                Top Cast
                            </h2>
                            {/* Grid Layout: 2 Cols Mobile, 4 Cols Desktop (max 8 items) */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {movie.credits?.cast?.slice(0, 8).map((actor: any) => (
                                    <Link
                                        href={`/castdetails/${actor.id}`}
                                        key={actor.id}
                                        className="block"
                                    >
                                        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center group h-full hover:scale-105 duration-300">
                                            <div className="w-20 h-20 mx-auto mb-3 relative rounded-full overflow-hidden bg-gray-100 border border-gray-100">
                                                {actor.profile_path ? (
                                                    <Image
                                                        src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                                        alt={actor.name}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">N/A</div>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-sm text-black line-clamp-2 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{actor.name}</h3>
                                            <p className="text-[10px] text-indigo-500 line-clamp-1">{actor.character}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>


                        {/* 3. Detailed Info Grid (Sidebar on Desktop) */}
                        <aside className="w-full lg:w-80 lg:shrink-0">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-black">
                                <span className="w-1 h-8 bg-black rounded-full" />
                                Show Info
                            </h2>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                <div>
                                    <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Creator</h3>
                                    <p className="font-medium text-lg text-black border-b border-gray-100 pb-2">{director || "Unknown"}</p>
                                </div>

                                <div>
                                    <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Status</h3>
                                    <p className="font-medium text-black border-b border-gray-100 pb-2">{movie.status}</p>
                                </div>

                                <div>
                                    <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Original Language</h3>
                                    <p className="font-medium text-black uppercase border-b border-gray-100 pb-2">{movie.original_language}</p>
                                </div>

                                {movie.production_companies?.length > 0 && (
                                    <div>
                                        <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Production</h3>
                                        <p className="font-medium text-black text-sm">
                                            {movie.production_companies.map((c: any) => c.name).slice(0, 2).join(", ")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>

                </div>

                {/* Recommendations Carousel (Suspense) */}
                <section>
                    <Suspense fallback={<div className="h-64 rounded-xl bg-white/5 animate-pulse" />}>
                        <RecommendedMovies movieId={movieId} mediaType="tv" />
                    </Suspense>
                </section>

                {/* Seasons & Episodes */}
                {movie.seasons && movie.seasons.length > 0 && (
                    <SeasonEpisodeList tvId={movieId} seasons={movie.seasons} />
                )}

            </div>
        </main >
    );
}
