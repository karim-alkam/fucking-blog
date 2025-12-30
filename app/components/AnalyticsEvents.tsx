'use client';

import { useEffect } from 'react';
import { sendGAEvent } from '@next/third-parties/google';

interface AnalyticsEventsProps {
    eventName: string;
    eventParams?: Record<string, string | number | boolean>;
}

export default function AnalyticsEvents({ eventName, eventParams }: AnalyticsEventsProps) {
    useEffect(() => {
        sendGAEvent('event', eventName, eventParams || {});
    }, [eventName, eventParams]);

    return null;
}
