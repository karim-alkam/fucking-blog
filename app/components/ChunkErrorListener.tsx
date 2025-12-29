'use client';

import { useEffect } from 'react';

export default function ChunkErrorListener() {
    useEffect(() => {
        function handleError(event: any) {
            const error = event.error || event.reason;
            if (
                error &&
                (error.name === 'ChunkLoadError' ||
                    /Loading chunk [\d]+ failed/.test(error.message))
            ) {
                // Reload to fetch the latest version of the application
                window.location.reload();
            }
        }

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleError);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleError);
        };
    }, []);

    return null;
}
