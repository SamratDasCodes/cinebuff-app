"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Download, X, Maximize2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageItem {
    file_path: string;
    width: number;
    height: number;
    vote_average: number;
    vote_count: number;
}

interface GalleryGridProps {
    backdrops: ImageItem[];
    posters: ImageItem[];
    logos: ImageItem[];
    profiles?: ImageItem[]; // For person
    title: string;
}

export function GalleryGrid({ backdrops, posters, logos, profiles, title }: GalleryGridProps) {
    const [activeTab, setActiveTab] = useState<'backdrops' | 'posters' | 'logos' | 'profiles'>('backdrops');
    const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Determine initial active tab
    useEffect(() => {
        if (profiles && profiles.length > 0) setActiveTab('profiles');
        else if (backdrops.length > 0) setActiveTab('backdrops');
        else if (posters.length > 0) setActiveTab('posters');
    }, [backdrops, posters, profiles]); // Removed logos from dep to avoid default logo tab unless necessary

    const currentImages = activeTab === 'profiles' ? profiles :
        activeTab === 'backdrops' ? backdrops :
            activeTab === 'posters' ? posters :
                logos;

    const downloadImage = async (path: string, type: 'original' | 'w500') => {
        setIsDownloading(true);
        try {
            const url = `https://image.tmdb.org/t/p/${type}${path}`;
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${title.replace(/[^a-z0-9]/gi, '_')}_${type}${path}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (e) {
            console.error("Download failed:", e);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* TABS */}
            <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-4">
                {(profiles && profiles.length > 0) && (
                    <button
                        onClick={() => setActiveTab('profiles')}
                        className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${activeTab === 'profiles' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Profiles ({profiles.length})
                    </button>
                )}
                {backdrops.length > 0 && (
                    <button
                        onClick={() => setActiveTab('backdrops')}
                        className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${activeTab === 'backdrops' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Backdrops ({backdrops.length})
                    </button>
                )}
                {posters.length > 0 && (
                    <button
                        onClick={() => setActiveTab('posters')}
                        className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${activeTab === 'posters' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Posters ({posters.length})
                    </button>
                )}
                {logos.length > 0 && (
                    <button
                        onClick={() => setActiveTab('logos')}
                        className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${activeTab === 'logos' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'}`}
                    >
                        Logos ({logos.length})
                    </button>
                )}
            </div>

            {/* GRID */}
            {(!currentImages || currentImages.length === 0) ? (
                <div className="text-center py-20 text-neutral-500">No images found for this category.</div>
            ) : (
                <div className={`grid gap-4 ${activeTab === 'posters' || activeTab === 'profiles' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`}>
                    {currentImages.map((img) => (
                        <motion.div
                            layoutId={img.file_path}
                            key={img.file_path}
                            className="relative group cursor-pointer overflow-hidden rounded-xl bg-neutral-900 aspect-[16/9] data-[portrait=true]:aspect-[2/3]"
                            data-portrait={activeTab === 'posters' || activeTab === 'profiles'}
                            onClick={() => setSelectedImage(img)}
                        >
                            <Image
                                src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                                alt="Gallery Image"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 className="text-white drop-shadow-md" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* LIGHTBOX MODAL */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <button
                            className="absolute top-4 right-4 p-2 bg-neutral-800 rounded-full text-white hover:bg-neutral-700 z-[110]"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={24} />
                        </button>

                        <div
                            className="relative max-w-7xl max-h-[90vh] w-full flex flex-col items-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative w-full h-[80vh]">
                                <Image
                                    src={`https://image.tmdb.org/t/p/original${selectedImage.file_path}`}
                                    alt="Full Size"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>

                            <div className="mt-4 flex items-center gap-4">
                                <button
                                    onClick={() => downloadImage(selectedImage.file_path, 'original')}
                                    disabled={isDownloading}
                                    className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-all disabled:opacity-50"
                                >
                                    {isDownloading ? <Loader2 className="animate-spin" /> : <Download size={20} />}
                                    Download Original ({selectedImage.width}x{selectedImage.height})
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
