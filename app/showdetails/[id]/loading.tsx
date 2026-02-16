
export default function Loading() {
    return (
        <div className="min-h-screen bg-[#fafafa] relative animate-pulse">
            {/* HERO SECTION Skeleton */}
            <div className="relative w-full min-h-[70vh] lg:min-h-[85vh] bg-gray-200">
                <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent" />
            </div>

            <div className="container mx-auto px-6 -mt-32 relative z-10 flex flex-col md:flex-row gap-8 items-end">
                {/* Poster Skeleton */}
                <div className="hidden md:block w-64 lg:w-80 aspect-[2/3] bg-gray-300 rounded-2xl shadow-lg" />

                {/* Text Info Skeleton */}
                <div className="flex-1 space-y-6 w-full max-w-4xl pb-12">
                    <div className="space-y-4">
                        <div className="h-12 md:h-16 bg-gray-300 rounded-lg w-3/4" />
                        <div className="h-6 bg-gray-200 rounded w-1/2" />
                    </div>

                    <div className="flex gap-4">
                        <div className="h-6 w-16 bg-gray-200 rounded" />
                        <div className="h-6 w-16 bg-gray-200 rounded" />
                        <div className="h-6 w-16 bg-gray-200 rounded" />
                    </div>

                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <div className="h-12 w-32 bg-gray-300 rounded-full" />
                        <div className="h-12 w-32 bg-gray-200 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
