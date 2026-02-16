"use client";

import { MoodFilterTray } from "@/components/MoodFilterTray";
import { MovieModal } from "@/components/MovieModal";
import { PersonModal } from "@/components/PersonModal";
import { SyncStatus } from "@/components/SyncStatus";
import { ScrollButtons } from "@/components/ScrollButtons";

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
            <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-4">
                <MovieModal />
                <PersonModal />
                <SyncStatus />
                <ScrollButtons />

                <MoodFilterTray />

                <main className="min-h-screen pb-20">
                    {children}
                </main>
            </div>
        </div>
    );
}
