import { fetchMovieImages, fetchMovieDetails } from "@/lib/tmdb";
import { GalleryGrid } from "@/components/GalleryGrid";
import { BackButton } from "@/components/BackButton";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id, slug } = await params;
    const movie = await fetchMovieDetails(parseInt(id));
    return {
        title: `${movie?.title || 'Gallery'} - Photos | MoodCinema`,
        description: `View high-resolution photos, backdrops, and posters for ${movie?.title}.`
    };
}

export default async function TopLevelGalleryPage({ params }: PageProps) {
    const { id } = await params;
    const movieId = parseInt(id);

    // Fetch images
    const images = await fetchMovieImages(movieId, 'movie'); // Default to movie, could check type if needed? 
    // Actually, for shows we might need a separate route or check.
    // Assuming this route is /movie/[id]/... it is strictly movies.

    // We also need movie details for the title
    const movie = await fetchMovieDetails(movieId, 'movie');

    return (
        <main className="min-h-screen bg-[#050505] text-white pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
                <div className="mb-8">
                    <BackButton />
                    <h1 className="text-3xl font-bold mt-4 mb-2">
                        <span className="text-neutral-400">Gallery:</span> {movie?.title}
                    </h1>
                    <p className="text-neutral-500">
                        {images.backdrops.length} Backdrops • {images.posters.length} Posters • {images.logos.length} Logos
                    </p>
                </div>

                <GalleryGrid
                    backdrops={images.backdrops}
                    posters={images.posters}
                    logos={images.logos}
                    title={movie?.title || 'image'}
                />
            </div>
        </main>
    );
}
