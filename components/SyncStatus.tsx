'use client';

import { useMovieStore } from "@/store/useMovieStore";
import { Loader2, Check, CloudOff, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function SyncStatus() {
    const status = useMovieStore((state) => state.syncStatus);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (status === 'idle') {
            const timer = setTimeout(() => setVisible(false), 2000);
            return () => clearTimeout(timer);
        }
        setVisible(true);
    }, [status]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-white shadow-2xl pointer-events-none"
                >
                    {status === 'syncing' && (
                        <>
                            <Loader2 size={16} className="animate-spin text-blue-400" />
                            <span className="text-sm font-medium">Syncing...</span>
                        </>
                    )}
                    {status === 'saved' && (
                        <>
                            <Check size={16} className="text-green-400" />
                            <span className="text-sm font-medium">Saved to Cloud</span>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <CloudOff size={16} className="text-red-400" />
                            <span className="text-sm font-medium">Sync Failed</span>
                        </>
                    )}
                    {status === 'idle' && (
                        <>
                            <Cloud size={16} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-400">Synced</span>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
