export default function Loading() {
    return (
        <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
            {/* Nav Skeleton */}
            <div className="fixed top-6 left-6 z-50">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse border border-black/5" />
            </div>

            <div className="container mx-auto px-6 py-24 md:py-32">
                {/* Profile Header Skeleton */}
                <div className="flex flex-col md:flex-row gap-12 items-start mb-20">
                    {/* Profile Image */}
                    <div className="w-full md:w-80 aspect-[2/3] relative rounded-3xl overflow-hidden bg-gray-200 animate-pulse shadow-sm shrink-0" />

                    {/* Bio */}
                    <div className="flex-1 space-y-8 w-full">
                        <div>
                            <div className="h-16 bg-gray-200 rounded-2xl w-3/4 animate-pulse mb-6" />
                            <div className="flex flex-wrap gap-6">
                                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Filmography Grid Skeleton */}
                <div>
                    <div className="h-10 w-48 bg-gray-200 rounded-xl mb-12 animate-pulse" />

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="aspect-[2/3] rounded-2xl bg-gray-200 animate-pulse border border-black/5" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
