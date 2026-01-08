'use client';

import { useEffect, useRef } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useFarcasterContext } from '@/providers/FarcasterProvider';

export function FarcasterAutoConnect() {
    const { isConnected } = useAccount();
    const { connect, connectors } = useConnect();
    const { context, isSDKLoaded } = useFarcasterContext();
    const attemptedRef = useRef(false);

    useEffect(() => {
        // Only run if SDK is loaded, context exists (user authenticated), and wallet is NOT connected
        if (isSDKLoaded && context?.user && !isConnected && !attemptedRef.current) {
            console.log('Farcaster Context detected. Attempting auto-connect...');

            // Find the injected connector (usually what Frames/MiniApps use)
            // We prioritize 'injected' or 'farcaster' if available in latest rainbowkit/wagmi versions
            const connector = connectors.find(c => c.id === 'injected' || c.name.toLowerCase().includes('frame'));

            if (connector) {
                attemptedRef.current = true; // Prevent loop
                connect({ connector }, {
                    onSuccess: () => console.log('Auto-connected via Farcaster context'),
                    onError: (err) => {
                        console.error('Auto-connect failed', err);
                        // Reset ref if we want to retry, but usually better to fail silent after one try
                        // attemptedRef.current = false; 
                    }
                });
            } else {
                console.warn('No suitable connector found for auto-connect');
            }
        }
    }, [isSDKLoaded, context, isConnected, connect, connectors]);

    return null; // This component does not render anything
}
