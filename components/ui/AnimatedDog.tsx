"use client";
import { motion } from "framer-motion";

export function AnimatedDog() {
    return (
        <div className="relative w-64 h-64 flex items-center justify-center">
            {/* SVG Dog */}
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">

                {/* Body */}
                <motion.path
                    d="M60 120 Q60 160 100 160 H140 Q160 160 160 140 V100 Q160 80 140 80 H100 Q60 80 60 120 Z"
                    fill="#3730a3" // Indigo-900 (Dark body)
                />

                {/* Head */}
                <motion.g
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ originX: "60px", originY: "100px" }}
                >
                    <rect x="40" y="60" width="60" height="60" rx="20" fill="#4f46e5" /> {/* Indigo-600 */}

                    {/* Ears (Wiggling) */}
                    <motion.path
                        d="M50 60 L40 30 L60 60 Z"
                        fill="#312e81"
                        animate={{ rotate: [0, 10, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                    />
                    <motion.path
                        d="M90 60 L100 30 L80 60 Z"
                        fill="#312e81"
                        animate={{ rotate: [0, -10, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2.2 }}
                    />

                    {/* Eyes (Blinking) */}
                    <motion.circle cx="60" cy="85" r="4" fill="white" animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }} />
                    <motion.circle cx="80" cy="85" r="4" fill="white" animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }} />

                    {/* Nose */}
                    <circle cx="70" cy="95" r="5" fill="#1e1b4b" />
                </motion.g>

                {/* Tail (Wagging) */}
                <motion.path
                    d="M160 100 Q180 80 190 90"
                    stroke="#4f46e5"
                    strokeWidth="8"
                    strokeLinecap="round"
                    style={{ originX: "160px", originY: "100px" }}
                    animate={{ rotate: [0, 20, 0, 15, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Legs */}
                <path d="M70 160 V180" stroke="#312e81" strokeWidth="8" strokeLinecap="round" />
                <path d="M130 160 V180" stroke="#312e81" strokeWidth="8" strokeLinecap="round" />

            </svg>
        </div>
    );
}
