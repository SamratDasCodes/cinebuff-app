import { fetchPersonImages, fetchPersonDetails } from "@/lib/tmdb";
import { GalleryGrid } from "@/components/GalleryGrid";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{ id: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const details = await fetchPersonDetails(parseInt(id));
    return {
        title: `${details?.name || 'Person'} - Photo Gallery`,
        description: `High resolution photos of ${details?.name}`,
    };
}

export default async function PersonGalleryPage({ params }: PageProps) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const [images, details] = await Promise.all([
        fetchPersonImages(id),
        fetchPersonDetails(id)
    ]);

    return (
        <main className="min-h-screen bg-[#050505] text-white pb-20">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
                <div className="mb-8">
                    {/* Reuse BackButton or simple link */}
                    <a href={`/castdetails/${id}`} className="inline-flex items-center text-neutral-400 hover:text-white mb-4 transition-colors">
                        ← Back to Profile
                    </a>
                    <h1 className="text-3xl font-bold mt-4 mb-2">
                        <span className="text-neutral-400">Gallery:</span> {details?.name}
                    </h1>
                    <p className="text-neutral-500">
                        {images.profiles.length} Profiles
                    </p>
                </div>

                <GalleryGrid
                    backdrops={[]}
                    posters={[]}
                    logos={[]}
                    profiles={images.profiles || []}
                    title={details?.name || "Person"}
                />
            </div>
        </main>
    );
}
