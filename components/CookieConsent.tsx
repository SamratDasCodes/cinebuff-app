"use client";

import { useMovieStore } from "@/store/useMovieStore";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function CookieConsent() {
    const { cookieConsent, setCookieConsent } = useMovieStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Delay slightly to avoid flash
        const timer = setTimeout(() => {
            if (cookieConsent === null) {
                setIsVisible(true);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [cookieConsent]);

    const handleAccept = () => {
        setCookieConsent(true);
        setIsVisible(false);
    };

    const handleDecline = () => {
        setCookieConsent(false);
        setIsVisible(false);
    };

    if (cookieConsent !== null) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center pointer-events-none"
                >
                    <div className="bg-white/95 backdrop-blur-md border border-black/10 shadow-2xl p-6 rounded-3xl w-full max-w-2xl pointer-events-auto flex flex-col md:flex-row items-center gap-6">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 text-indigo-600">
                            <Cookie size={24} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h3 className="font-bold text-lg text-black">We value your privacy</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                We use cookies and local storage to save your preferences, watch history, and provide a personalized experience.
                                We also assign a unique device ID to sync your profile.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 shrink-0">
                            <button
                                onClick={handleDecline}
                                className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={handleAccept}
                                className="px-6 py-2.5 rounded-full text-sm font-bold bg-black text-white hover:bg-gray-800 hover:scale-105 shadow-lg transition-all flex items-center gap-2"
                            >
                                <ShieldCheck size={16} />
                                Allow All
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
