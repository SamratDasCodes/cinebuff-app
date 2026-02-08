import { fetchPersonDetails, fetchPersonMovieCredits } from "@/lib/tmdb";
import { Movie, CastCredit } from "@/lib/constants";
import { MovieCard } from "@/components/MovieCard";
import Image from "next/image";
import { BackButton } from "@/components/BackButton";
import { Calendar, MapPin, Camera } from "lucide-react";
import Link from "next/link";


interface PageProps {
    params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export default async function CastDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const personId = parseInt(id);

    const [person, credits] = await Promise.all([
        fetchPersonDetails(personId),
        fetchPersonMovieCredits(personId)
    ]);

    if (!person) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-black">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-500">Person not found.</p>
                </div>
            </div>
        );
    }

    // Map CastCredit to Movie interface for MovieCard compatibility
    const movies: Movie[] = credits.filter(c => c.poster_path).map(c => ({
        id: c.id,
        title: c.title,
        poster_path: c.poster_path, // Updated to use poster_path
        backdrop_path: '', // Not available in credits
        overview: '', // Not available in credits
        release_date: c.release_date,
        vote_average: c.vote_average,
        genre_ids: [],
        adult: false, // Default
        original_language: 'en'
    }));

    return (
        <main className="min-h-screen bg-[#fafafa] text-black">
            <div className="fixed top-6 left-6 z-50">
                <BackButton />
            </div>

            <div className="container mx-auto px-6 py-24 md:py-32">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-12 items-start mb-20">
                    {/* Profile Image */}
                    <div className="w-full md:w-80 aspect-[2/3] relative rounded-3xl overflow-hidden shadow-2xl shrink-0">
                        {person.profile_path ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                                alt={person.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black mb-4">
                                {person.name}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-gray-500 font-medium">
                                {person.birthday && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} />
                                        <span>Born {person.birthday}</span>
                                    </div>
                                )}
                                {person.place_of_birth && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} />
                                        <span>{person.place_of_birth}</span>
                                    </div>
                                )}
                                <div className="px-3 py-1 bg-gray-100 rounded-full text-xs uppercase tracking-widest text-black/60 font-bold">
                                    {person.known_for_department}
                                </div>

                                {/* Photos Gallery Link */}
                                <Link
                                    href={`/person/${personId}/${person.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}/photos`}
                                    className="px-4 py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                    <Camera size={14} />
                                    <span>Gallery</span>
                                </Link>
                            </div>
                        </div>

                        {person.biography && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Biography</h3>
                                <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-line max-w-3xl">
                                    {person.biography}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Filmography Grid */}
                <div>
                    <h2 className="text-3xl font-bold mb-12 flex items-center gap-3">
                        <span className="w-1 h-10 bg-black rounded-full" />
                        Filmography
                    </h2>

                    {movies.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {movies.map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No movies found.</p>
                    )}
                </div>
            </div>
        </main>
    );
}
