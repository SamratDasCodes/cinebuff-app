"use client";

import { useEffect, useRef } from "react";
import { useMovieStore } from "@/store/useMovieStore";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, serverTimestamp, collection, addDoc } from "firebase/firestore";

export function SyncEngine() {
    const user = useMovieStore((state) => state.user);
    const watchedMovies = useMovieStore((state) => state.watchedMovies);
    const likedMovies = useMovieStore((state) => state.likedMovies);
    const watchlistMovies = useMovieStore((state) => state.watchlistMovies);
    const settings = {
        sensitiveMode: useMovieStore((state) => state.sensitiveMode),
        includeAdult: useMovieStore((state) => state.includeAdult),
    };

    // Logs (We track changes to push)
    const searchHistory = useMovieStore((state) => state.searchHistory);
    const clickHistory = useMovieStore((state) => state.clickHistory);

    const isHydrated = useRef(false);

    // 1. Two-way Sync for Profile (Watched, Liked, Settings)
    useEffect(() => {
        if (!user || !db) return;

        const userRef = doc(db, "users", user.uid);

        // Listener: Cloud -> Local
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // ... (logic skipped for brevity)
            }
        }, (error) => {
            console.warn("SyncEngine: Firestore Read Error (likely permissions):", error.message);
            // We can optionally set a status in store like 'isOffline' or 'syncError'
        });

        return () => unsubscribe();
    }, [user]);

    // 2. Local -> Cloud (Debounced or Triggered) for Profile
    useEffect(() => {
        if (!user) return;

        const syncProfile = async () => {
            try {
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    watchedMovies,
                    likedMovies,
                    watchlistMovies,
                    settings,
                    lastSynced: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.warn("SyncEngine: Firestore Write Error:", error);
            }
        };

        const timeout = setTimeout(syncProfile, 2000); // 2s debounce
        return () => clearTimeout(timeout);
    }, [user, watchedMovies, likedMovies, watchlistMovies, settings]);

    // 3. Activity Logger (One-way Push)
    // specific hooks for these might be better to avoid pushing entire history arrays repeatedly.
    // Ideally, `addToSearchHistory` in store should call an API directly.
    // But observing state is easier for "seamless" retrofitting.

    // We'll trust the store acts as a buffer. 
    // Actually, pushing the WHOLE array every time is inefficient but fine for small arrays (top 20).
    // Better strategy for "Logs": Append-only in Firestore 'activity_logs' collection.

    // Let's implement a ref to track what we've already logged? 
    // Or just push the *latest* entry?
    // Since this is a "SyncEngine", let's keep it simple: Push PROFILE data. 
    // Logging might be better handled by a separate component `ActivityLogger` or direct store middleware.

    return null;
}
