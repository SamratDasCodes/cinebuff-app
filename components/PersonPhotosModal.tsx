"use client";

import { useState } from "react";
import Image from "next/image";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"; // Removed: Unused
import { X, Download, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import { MicroButton } from "./ui/MicroButton"; // Removed: Unused

interface PersonPhotosModalProps {
    photos: { file_path: string; aspect_ratio: number }[];
    name: string;
}

export function PersonPhotosModal({ photos, name }: PersonPhotosModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

    // Filter out very wide images if we only want portraits, or keep all.
    // Profiles are usually vertical.
    const validPhotos = photos.filter(p => p.file_path);

    if (validPhotos.length === 0) return null;

    const downloadImage = async (path: string, index: number) => {
        try {
            const imageUrl = `https://image.tmdb.org/t/p/original${path}`;
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${name.replace(/\s+/g, '_')}_photo_${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            window.open(`https://image.tmdb.org/t/p/original${path}`, '_blank');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all font-medium backdrop-blur-md border border-white/10"
            >
                <ImageIcon size={20} />
                <span>Photos ({validPhotos.length})</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-6xl h-[85vh] bg-[#111] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <ImageIcon className="text-indigo-400" />
                                    {name}&apos;s Photos
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Grid */}
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {validPhotos.map((photo, index) => (
                                        <div
                                            key={photo.file_path}
                                            className="group relative aspect-[2/3] bg-neutral-900 rounded-xl overflow-hidden border border-white/5 shadow-md hover:border-indigo-500/50 transition-colors"
                                        >
                                            <Image
                                                src={`https://image.tmdb.org/t/p/h632${photo.file_path}`}
                                                alt={`${name} photo ${index + 1}`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />

                                            {/* Overlay Actions */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                {/* Download Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        downloadImage(photo.file_path, index);
                                                    }}
                                                    className="p-3 rounded-full bg-white text-black hover:bg-indigo-400 hover:text-white transition-all transform hover:scale-110 shadow-lg"
                                                    title="Download"
                                                >
                                                    <Download size={20} />
                                                </button>

                                                {/* View Button (optional, simple new tab for now or lightbox later if needed) */}
                                                <button
                                                    onClick={() => window.open(`https://image.tmdb.org/t/p/original${photo.file_path}`, '_blank')}
                                                    className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20"
                                                    title="Open Original"
                                                >
                                                    <ImageIcon size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
