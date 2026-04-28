import { useState, useEffect } from 'react';
import type { Action } from '../models/Action';
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    return isOnline ;
}

export const queueAction = (action: Action) => {
    const queue= JSON.parse(localStorage.getItem('actionQueue') || '[]');
    queue.push(action);
    localStorage.setItem('actionQueue', JSON.stringify(queue));
}

export function getQueuedActions(): Action[] {
    return JSON.parse(localStorage.getItem('actionQueue') || '[]');
}

export function clearQueuedActions() {
    localStorage.removeItem('actionQueue');
}
