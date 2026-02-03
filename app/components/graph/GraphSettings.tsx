import React, { useState, useRef, useEffect } from 'react';

interface GraphSettingsProps {
    filters: Record<string, boolean>;
    onToggle: (type: string) => void;
    className?: string;
    alwaysShowOnDesktop?: boolean;
}

const FILTER_CONFIG: Record<string, { label: string; color: string }> = {
    post: { label: 'POSTS', color: '#FF003C' },
    drawing: { label: 'DRAWINGS', color: '#FCEE0A' },
    board: { label: 'BOARDS', color: '#FF6600' },
    tag: { label: 'TAGS', color: '#7000FF' },
    external: { label: 'EXTERNAL', color: '#39FF14' },
    asset: { label: 'ASSETS', color: '#00F0FF' },
};

export function GraphSettings({ filters, onToggle, className = '', alwaysShowOnDesktop = false }: GraphSettingsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={`absolute top-12 right-4 z-50 text-left ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 flex items-center justify-center bg-cyber-black/80 border text-cyber-neon-cyan hover:text-cyber-neon-yellow border-cyber-neon-cyan hover:border-cyber-neon-yellow transition-all duration-300 rounded-sm ${alwaysShowOnDesktop ? 'lg:hidden' : ''}`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`w-6 h-6 transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`}
                >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>

            <div className={`absolute right-0 mt-2 w-56 origin-top-right bg-cyber-dark-gray border border-cyber-neon-cyan shadow-lg shadow-cyber-neon-cyan/20 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 ${isOpen ? 'block animate-in fade-in slide-in-from-top-2' : 'hidden'} ${alwaysShowOnDesktop ? 'lg:block' : ''}`}>
                <div className="py-2 px-3">
                    <h3 className="text-xs font-display font-bold text-cyber-neon-cyan mb-3 tracking-widest border-b border-cyber-gray pb-1">
                        NODE_FILTERS
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(FILTER_CONFIG).map(([type, config]) => (
                            <div key={type} className="flex items-center justify-between group">
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]"
                                        style={{ color: config.color, backgroundColor: config.color }}
                                    />
                                    <span className={`text-xs font-mono transition-colors ${filters[type] ? 'text-cyber-white' : 'text-cyber-gray-light'}`}>
                                        {config.label}
                                    </span>
                                </div>
                                <button
                                    onClick={() => onToggle(type)}
                                    className={`relative inline-flex h-4 w-8 items-center rounded-none border transition-colors focus:outline-none ${filters[type] ? 'border-cyber-neon-cyan' : 'border-cyber-gray'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-2 w-2 transform bg-current transition-transform ${filters[type]
                                            ? 'translate-x-5 text-cyber-neon-cyan shadow-[0_0_8px_currentColor]'
                                            : 'translate-x-1 text-cyber-gray'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
