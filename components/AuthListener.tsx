"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useMovieStore } from "@/store/useMovieStore";

export function AuthListener() {
    const setUser = useMovieStore((state) => state.setUser);

    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("AuthListener: State Changed. User:", currentUser?.uid);
            // Serializing user object because Redux/Zustand don't like non-serializable data
            // and Firebase User object has methods on it.
            if (currentUser) {
                const serializedUser = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                };
                setUser(serializedUser);
                console.log("AuthListener: setUser called with", currentUser.uid);
            } else {
                setUser(null);
                console.log("AuthListener: setUser called with null");
            }
        });

        return () => unsubscribe();
    }, [setUser]);

    return null; // This component handles side effects only
}
