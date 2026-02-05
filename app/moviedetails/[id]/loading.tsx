export default function Loading() {
    return (
        <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
            {/* Nav Skeleton */}
            <div className="fixed top-6 left-6 z-50">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse border border-black/5" />
            </div>

            {/* Hero Skeleton */}
            <div className="relative w-full min-h-[70vh] lg:min-h-[85vh] flex items-end">
                <div className="absolute inset-0 bg-gray-100 animate-pulse" />

                <div className="relative z-10 w-full pb-12 pt-32 lg:pb-20">
                    <div className="container mx-auto px-6 flex flex-col md:flex-row gap-8 items-end">
                        {/* Poster Skeleton */}
                        <div className="hidden md:block w-64 lg:w-80 aspect-[2/3] rounded-2xl bg-gray-200 animate-pulse shadow-xl border border-white/10" />

                        {/* Text Info Skeleton */}
                        <div className="flex-1 space-y-6 max-w-4xl w-full">
                            <div className="space-y-4">
                                <div className="h-12 md:h-20 bg-gray-200 rounded-xl w-3/4 animate-pulse" />
                                <div className="h-6 bg-gray-200 rounded-lg w-1/3 animate-pulse" />
                            </div>

                            <div className="flex gap-4">
                                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                            </div>

                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <div className="h-14 w-40 bg-gray-200 rounded-full animate-pulse" />
                                <div className="h-14 w-40 bg-gray-200 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
