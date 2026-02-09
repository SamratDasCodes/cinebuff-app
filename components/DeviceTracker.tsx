"use client";

import { useEffect } from "react";
import { useMovieStore } from "@/store/useMovieStore";
import { db, auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { getDeviceInfo } from "@/lib/deviceUtils";
import { onAuthStateChanged } from "firebase/auth";

export function DeviceTracker() {
    const { user } = useMovieStore();

    useEffect(() => {
        let unsubscribeSnapshot: (() => void) | null = null;

        // Listen to Auth State Changes
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            // Clean up previous snapshot listener if user changes
            if (unsubscribeSnapshot) {
                unsubscribeSnapshot();
                unsubscribeSnapshot = null;
            }

            if (currentUser) {
                try {
                    const deviceInfo = getDeviceInfo();
                    // Store device info in Firestore subcollection
                    // Path: /users/{userId}/devices/{deviceId}
                    const deviceRef = doc(db, "users", currentUser.uid, "devices", deviceInfo.deviceId);

                    await setDoc(deviceRef, {
                        ...deviceInfo,
                        lastActive: serverTimestamp(),
                        // We can't easily get IP client-side without an external service, 
                        // so we omit it or would need a Cloud Function.
                    }, { merge: true });

                    // Listen for this device being deleted (Revoked)
                    unsubscribeSnapshot = onSnapshot(doc(db, "users", currentUser.uid, "devices", deviceInfo.deviceId), (docSnapshot) => {
                        // If the document does not exist, it means it was deleted (revoked)
                        if (!docSnapshot.exists()) {
                            // console.log("Device revoked. Logging out...");
                            auth.signOut().then(() => {
                                window.location.href = "/"; // Force redirect to home
                            });
                        }
                    });

                    // console.log("Device tracked:", deviceInfo.deviceName);
                } catch (error) {
                    console.error("Failed to track device:", error);
                }
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    return null; // This component handles logic only, no UI
}
