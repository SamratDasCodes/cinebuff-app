"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home/movies');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
    </div>
  );
}
