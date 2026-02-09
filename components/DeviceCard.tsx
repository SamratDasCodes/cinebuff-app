"use client";

import { Monitor, Smartphone, Tablet, Trash2, Clock, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useState } from "react";
import { getDeviceInfo } from "@/lib/deviceUtils";

interface DeviceProps {
    id: string; // The doc ID (which is the deviceId)
    data: {
        deviceName: string;
        os: string;
        browser: string;
        type: string;
        lastActive: any; // Timestamp
        deviceId: string;
    };
    isCurrent: boolean;
}

export function DeviceCard({ id, data, isCurrent }: DeviceProps) {
    const [isRevoking, setIsRevoking] = useState(false);

    const handleRevoke = async () => {
        if (!auth.currentUser) return;
        if (!confirm(`Are you sure you want to remove access for "${data.deviceName}"?`)) return;

        setIsRevoking(true);
        try {
            await deleteDoc(doc(db, "users", auth.currentUser.uid, "devices", id));
        } catch (e) {
            console.error("Revoke failed", e);
            alert("Failed to remove device.");
        } finally {
            setIsRevoking(false);
        }
    };

    // Icon logic
    const Icon = data.type?.toLowerCase() === 'mobile' ? Smartphone :
        data.type?.toLowerCase() === 'tablet' ? Tablet :
            Monitor;

    // Time logic
    const lastActiveDate = data.lastActive?.toDate ? data.lastActive.toDate() : new Date();
    const timeAgo = Math.floor((Date.now() - lastActiveDate.getTime()) / 60000); // Minutes
    const timeDisplay = timeAgo < 1 ? "Just now" :
        timeAgo < 60 ? `${timeAgo}m ago` :
            `${Math.floor(timeAgo / 60)}h ago`;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative p-4 rounded-xl border flex items-center gap-4 transition-all group ${isCurrent
                ? "bg-indigo-500/10 border-indigo-500/30"
                : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
        >
            <div className={`p-3 rounded-full ${isCurrent ? "bg-indigo-500/20 text-indigo-400" : "bg-white/10 text-neutral-400"}`}>
                <Icon size={24} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className={`font-semibold truncate ${isCurrent ? "text-white" : "text-neutral-300"}`}>
                        {data.deviceName}
                    </h3>
                    {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white uppercase tracking-wider">
                            Current
                        </span>
                    )}
                </div>
                <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                            <Globe size={12} /> {data.os}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} /> {timeDisplay}
                        </span>
                    </div>
                    <div className="text-[10px] font-mono text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5 w-fit border border-neutral-200">
                        ID: {id}
                    </div>
                </div>
            </div>

            {!isCurrent && (
                <button
                    onClick={handleRevoke}
                    disabled={isRevoking}
                    className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Revoke Access"
                >
                    {isRevoking ? <div className="w-5 h-5 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" /> : <Trash2 size={18} />}
                </button>
            )}
        </motion.div>
    );
}
