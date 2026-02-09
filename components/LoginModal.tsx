"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Loader2, User } from "lucide-react";

export function LoginModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper to get or create a persistent Device ID
    const getDeviceId = () => {
        let deviceId = localStorage.getItem("moodcinema_device_id");
        if (!deviceId) {
            deviceId = `dev_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
            localStorage.setItem("moodcinema_device_id", deviceId);
        }
        return deviceId;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (!auth) throw new Error("Firebase not configured.");

            // CONSTANT password to allow multi-device access (Zero Security Mode)
            const SHARED_PASS = "moodcinema-access";
            const deviceId = getDeviceId();

            // Fake email for User ID login
            const dummyEmail = `${email}@moodcinema.user`;

            let userUser;

            if (isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, SHARED_PASS);
                userUser = userCredential.user;
                // Set the display name to the raw User ID
                await updateProfile(userUser, { displayName: email });
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, dummyEmail, SHARED_PASS);
                userUser = userCredential.user;
            }

            // LINKING: Add this device ID to the user's profile
            if (userUser) {
                console.log("Login Successful, User:", userUser.uid);
                try {
                    const userRef = doc(db, "users", userUser.uid);
                    // Fire and forget (don't await to speed up UI)
                    setDoc(userRef, { deviceIds: arrayUnion(deviceId) }, { merge: true });
                    console.log("Device linked:", deviceId);
                } catch (e) {
                    console.warn("Device Link failed (permissions?):", e);
                }
            } else {
                console.error("Login returned no user object.");
            }
            onClose();
        } catch (err: any) {
            console.error("Auth Error (Full):", err);
            // Simplistic error mapping
            if (err.code === "auth/email-already-in-use") setError("User ID 'taken'. Try another.");
            else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
                setError("This ID uses an old security method. Please create a NEW User ID.");
            }
            else if (err.code === "auth/weak-password") setError("Password should be at least 6 characters.");
            else setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-white">
                                    {isSignUp ? "Create Account" : "Welcome Back"}
                                </h2>
                                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500 uppercase tracking-widest font-bold ml-1">User ID</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 text-gray-500 w-4 h-4" />
                                        <input
                                            type="text"
                                            required
                                            value={email} // We use this state variable for the User ID input
                                            onChange={(e) => setEmail(e.target.value.trim().toLowerCase())} // Enforce format
                                            placeholder="unique_username"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-gray-600"
                                            autoCapitalize="none"
                                            autoCorrect="off"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs leading-relaxed flex gap-2">
                                    <div className="shrink-0 mt-0.5">🌍</div>
                                    <p>
                                        <strong>Open Access:</strong> You can log in from <strong>any device</strong> using just this ID. Your device ID will be linked automatically.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (isSignUp ? "Create & Link Device" : "Log In")}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-gray-400 text-sm">
                                    {isSignUp ? "Already have an ID?" : "New here?"}
                                    <button
                                        onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                                        className="ml-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                    >
                                        {isSignUp ? "Log In" : "Claim User ID"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
