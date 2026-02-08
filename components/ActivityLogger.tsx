"use client";

import { useEffect, useRef } from "react";
import { useMovieStore } from "@/store/useMovieStore";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function ActivityLogger() {
    const user = useMovieStore((state) => state.user);
    const userId = useMovieStore((state) => state.userId);

    // Select specific state slices to observe
    const latestSearch = useMovieStore((state) => state.searchHistory[0]);
    const latestClick = useMovieStore((state) => state.clickHistory[0]);

    // Use refs to track previous values to prevent logging on mount/remount unless it's a new event
    const prevSearchRef = useRef<string | undefined>(latestSearch);
    const prevClickRef = useRef<any>(latestClick);

    useEffect(() => {
        // Only log if authenticated
        if (user && latestSearch && latestSearch !== prevSearchRef.current && db) {
            try {
                addDoc(collection(db, "activity_logs"), {
                    type: 'search',
                    userId: user?.uid || userId,
                    payload: { query: latestSearch },
                    timestamp: serverTimestamp(),
                    deviceInfo: navigator.userAgent
                });
            } catch (e) {
                // silent fail
            }
            prevSearchRef.current = latestSearch;
        }
    }, [latestSearch, user, userId]);

    useEffect(() => {
        // Compare IDs or timestamps to ensure it's a new click
        const isNew = latestClick && (
            latestClick.id !== prevClickRef.current?.id ||
            latestClick.timestamp !== prevClickRef.current?.timestamp
        );

        if (user && isNew && db) {
            try {
                addDoc(collection(db, "activity_logs"), {
                    type: 'click',
                    userId: user?.uid || userId,
                    payload: { id: latestClick.id, type: latestClick.type },
                    timestamp: serverTimestamp(),
                    deviceInfo: navigator.userAgent
                });
            } catch (e) {
                // silent fail
            }
            prevClickRef.current = latestClick;
        }
    }, [latestClick, user, userId]);

    return null;
}
