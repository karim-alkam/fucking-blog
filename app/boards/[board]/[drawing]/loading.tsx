export default function Loading() {
    return (
        <div className="p-4 mx-4 md:mx-0">
            <div className="flex flex-row items-center mb-4 gap-x-4">
                {/* Back Button Skeleton */}
                <div className="w-10 h-10 bg-gray-700 rounded animate-pulse" />
                {/* Title Skeleton */}
                <div className="h-8 w-64 bg-gray-700 rounded animate-pulse" />
            </div>

            {/* Excalidraw Viewer Skeleton */}
            <div className="h-[calc(100vh-180px)] w-full max-w-[1200px] mx-auto bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-gray-500 text-lg">
                    Loading Drawing...
                </div>
            </div>
        </div>
    );
}
