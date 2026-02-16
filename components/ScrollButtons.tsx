
"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollButtons() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });
    };

    // Render "Down" button always (or maybe hide if at bottom? simpler to show always)
    // Render "Up" button only if scrolled down.

    return (
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="p-3 bg-white text-black rounded-full shadow-lg hover:bg-gray-100 transition-all border border-gray-200"
                    aria-label="Scroll to top"
                >
                    <ChevronUp size={24} />
                </button>
            )}
            <button
                onClick={scrollToBottom}
                className="p-3 bg-white text-black rounded-full shadow-lg hover:bg-gray-100 transition-all border border-gray-200"
                aria-label="Scroll to bottom"
            >
                <ChevronDown size={24} />
            </button>
        </div>
    );
}
