"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Clapperboard, MonitorPlay, Sparkles } from "lucide-react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none"
                    >
                        <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl relative pointer-events-auto flex flex-col md:flex-row overflow-hidden">

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors z-20"
                            >
                                <X size={20} />
                            </button>

                            {/* Left Side: Aesthetic Visuals */}
                            <div className="hidden md:flex w-1/3 bg-neutral-900 relative flex-col justify-between p-8 border-r border-white/5">
                                <div className="absolute inset-0 opacity-20 bg-[url('https://image.tmdb.org/t/p/w500/1E5baAaEse26fej7uHkjDfoveCc.jpg')] bg-cover bg-center grayscale mix-blend-overlay"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]"></div>

                                <div className="relative z-10">
                                    <h2 className="text-3xl font-bold text-white mb-2 leading-tight">VibeCheck Cinema</h2>
                                    <p className="text-sm text-gray-400">Where feelings meet film.</p>
                                </div>

                                <div className="relative z-10 flex flex-col gap-4 mt-12">
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <Search size={14} />
                                        </div>
                                        <span>Instant Search</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                                            <Sparkles size={14} />
                                        </div>
                                        <span>Mood Engine</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                            <MonitorPlay size={14} />
                                        </div>
                                        <span>Where to Watch</span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                                    <p className="text-xs text-gray-500 italic">"I finally found something to watch without scrolling for an hour."</p>
                                </div>
                            </div>

                            {/* Right Side: Content Guide */}
                            <div className="flex-1 p-8 md:p-10 text-gray-300 space-y-8 overflow-y-auto custom-scrollbar">

                                {/* Section 1 */}
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-bold text-white">1</span>
                                        <h3 className="text-lg font-semibold text-white">Find Specific Titles</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-gray-400 ml-9">
                                        Use the large search bar at the top to find movies like <span className="text-white">"Anora"</span> or <span className="text-white">"Dune"</span>.
                                        The app instantly switches to "Search Mode".
                                    </p>
                                </div>

                                {/* Section 2 */}
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-bold text-white">2</span>
                                        <h3 className="text-lg font-semibold text-white">Discover by Vibe</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-gray-400 ml-9">
                                        Don't know what to watch? Tap a <span className="text-indigo-400">Mood Pill</span> like "Chill" or "Mind-bending".
                                        You can combine multiple moods to refine your recommendations.
                                    </p>
                                </div>

                                {/* Section 3 */}
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs font-bold text-white">3</span>
                                        <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-gray-400 ml-9">
                                        Click the <span className="text-white uppercase text-[10px] tracking-widest border border-white/20 px-1 rounded mx-1">Settings</span> icon to access granular controls:
                                        <br />• <span className="text-white">Year</span> (e.g. 2024)
                                        <br />• <span className="text-white">Language</span> (e.g. Korean, Hindi)
                                        <br />• <span className="text-white">Tags</span> (e.g. "Space", "Noir")
                                    </p>
                                </div>

                                {/* Section 4 */}
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 mt-4">
                                    <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                        <Clapperboard size={14} className="text-rose-400" /> Pro Tip
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        Active filters appear as chips under the search bar. Use the red <span className="text-rose-400">Clear All</span> button
                                        to instantly reset your discovery engine.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
