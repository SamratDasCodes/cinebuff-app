"use client";

import Image from "next/image";
import { Download, Maximize2 } from "lucide-react";
import { useState } from "react";

interface ImageCardProps {
    path: string;
    width?: number;
    height?: number;
    alt: string;
    type: "backdrop" | "poster" | "profile";
}

export function ImageCard({ path, width, height, alt, type }: ImageCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const aspectRatio = type === "backdrop" ? "aspect-video" : "aspect-[2/3]";
    const thumbnailSize = type === "backdrop" ? "w780" : "w500"; // optimized sizes
    const fullSizeUrl = `https://image.tmdb.org/t/p/original${path}`;
    const thumbnailUrl = `https://image.tmdb.org/t/p/${thumbnailSize}${path}`;

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch(fullSizeUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${alt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${type}_original.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback to opening in new tab
            window.open(fullSizeUrl, '_blank');
        }
    };

    return (
        <div
            className={`relative group overflow-hidden rounded-xl bg-neutral-900 border border-white/5 mb-4 break-inside-avoid ${aspectRatio}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Skeleton Loading State */}
            {isLoading && (
                <div className="absolute inset-0 bg-neutral-800 animate-pulse z-0" />
            )}

            <Image
                src={thumbnailUrl}
                alt={alt}
                width={width || 500}
                height={height || 750}
                className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110 blur-sm brightness-50' : 'scale-100'} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                unoptimized // TMDB handles optimization
            />

            {/* Overlay */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>

                {/* Dimensions Badge */}
                {width && height && (
                    <span className="px-3 py-1 text-xs font-mono font-medium text-white/70 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                        {width} x {height}
                    </span>
                )}

                <div className="flex items-center gap-2">
                    {/* View Fullscreen Button (Link to specific image or lightbox trigger in future) */}
                    <button
                        onClick={() => window.open(fullSizeUrl, '_blank')}
                        className="p-3 rounded-full bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md transition-all border border-white/20 hover:scale-110 active:scale-95"
                        title="View Full Resolution"
                    >
                        <Maximize2 size={20} />
                    </button>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        className="p-3 rounded-full bg-white text-black hover:bg-neutral-200 transition-all shadow-lg hover:scale-110 active:scale-95 flex items-center gap-2"
                        title="Download Original Quality"
                    >
                        <Download size={20} />
                        <span className="text-sm font-bold hidden sm:inline-block">HD</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
