"use client";

import { ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { MicroButton } from "./ui/MicroButton";

export function BackButton() {
    const router = useRouter();

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={() => router.back()}
                className="group flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white/90 hover:text-white transition-all duration-300 shadow-lg hover:shadow-indigo-500/20 active:scale-95"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-sm font-medium">Back</span>
            </button>
            <button
                onClick={() => router.push('/')}
                className="group flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white/90 hover:text-white transition-all duration-300 shadow-lg hover:shadow-indigo-500/20 active:scale-95"
            >
                <Home size={20} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm font-medium">Home</span>
            </button>
        </div>
    );
}
