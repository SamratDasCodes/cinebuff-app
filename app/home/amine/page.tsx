"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AmineRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/home/anime');
    }, [router]);

    return null;
}
