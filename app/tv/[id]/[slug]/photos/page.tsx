import { fetchMovieImages, fetchMovieDetails } from "@/lib/tmdb";
import { GalleryGrid } from "@/components/GalleryGrid";
import { BackButton } from "@/components/BackButton";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id, slug } = await params;
    const tv = await fetchMovieDetails(parseInt(id), 'tv');
    return {
        title: `${tv?.title || tv?.name || 'Gallery'} - Photos | MoodCinema`,
        description: `View high-resolution photos, backdrops, and posters for ${tv?.title || tv?.name}.`
    };
}

export default async function TvGalleryPage({ params }: PageProps) {
    const { id } = await params;
    const showId = parseInt(id);

    // Fetch images for TV
    const images = await fetchMovieImages(showId, 'tv');

    // Fetch details for title
    const tv = await fetchMovieDetails(showId, 'tv');
    const title = tv?.title || tv?.name || 'Show';

    return (
        <main className="min-h-screen bg-[#050505] text-white pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
                <div className="mb-8">
                    <BackButton />
                    <h1 className="text-3xl font-bold mt-4 mb-2">
                        <span className="text-neutral-400">Gallery:</span> {title}
                    </h1>
                    <p className="text-neutral-500">
                        {images.backdrops.length} Backdrops • {images.posters.length} Posters • {images.logos.length} Logos
                    </p>
                </div>

                <GalleryGrid
                    backdrops={images.backdrops}
                    posters={images.posters}
                    logos={images.logos}
                    title={title}
                />
            </div>
        </main>
    );
}
