export default function Loading() {
    return (
        <div className="container mx-auto max-w-7xl px-4 py-8 min-h-screen flex flex-col">
            <div className="flex flex-col mb-8 animate-pulse">
                <div className="w-32 h-6 bg-cyber-gray rounded mb-6"></div>
                <div className="w-2/3 h-12 bg-cyber-gray/50 rounded border-b border-cyber-gray"></div>
            </div>

            <div className="flex-1 bg-cyber-dark-gray border border-cyber-gray relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyber-gray/20 to-transparent skew-x-12 animate-shimmer"></div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-cyber-neon-cyan border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(0,240,255,0.3)]"></div>
                    <span className="font-mono text-cyber-neon-cyan tracking-widest text-sm animate-pulse">LOADING_DATA...</span>
                </div>
            </div>
        </div>
    );
}
