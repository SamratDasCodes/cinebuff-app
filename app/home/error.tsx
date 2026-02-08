'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-4">
                Oops! Connection Failed
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
                We couldn't connect to the movie database. This might be due to a strict firewall or internet issue.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="px-6 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition shadow-lg font-medium"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
