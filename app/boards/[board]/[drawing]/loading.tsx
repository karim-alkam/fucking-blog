export default function Loading() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 min-h-screen flex flex-col">
            <div className="flex flex-col mb-8 animate-pulse">
                <div className="w-32 h-6 bg-brass/20 rounded mb-6"></div>
                <div className="w-2/3 h-12 bg-brass/20/50 rounded border-b border-brass/20"></div>
            </div>

            <div className="flex-1 bg-deep-space border border-brass/20 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brass/20/20 to-transparent skew-x-12 animate-shimmer"></div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-celestial-blue border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(0,240,255,0.3)]"></div>
                    <span className="font-mono text-celestial-blue tracking-widest text-sm animate-pulse">LOADING_DATA...</span>
                </div>
            </div>
        </div>
    );
}
