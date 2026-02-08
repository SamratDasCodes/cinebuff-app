

import Link from "next/link";
import { AnimatedDog } from "@/components/ui/AnimatedDog";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FDFDFD] text-black flex flex-col items-center justify-center p-6 text-center">

            <div className="scale-125 mb-8">
                <AnimatedDog />
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-[#1a1a1a]">
                Whoops!
            </h1>

            <p className="text-gray-500 text-lg md:text-xl max-w-md mb-8 font-medium">
                We searched every frame, but we couldn't find the page you're looking for.
            </p>

            <Link
                href="/home/movies"
                className="
                    group flex items-center gap-2 px-6 py-3 rounded-full 
                    bg-black text-white font-bold tracking-wide 
                    hover:scale-105 active:scale-95 transition-all
                    shadow-lg hover:shadow-xl
                "
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Cinema
            </Link>

        </div>
    );
}
