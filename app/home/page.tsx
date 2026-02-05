"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRootRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/home/movies');
    }, [router]);

    return null;
}
