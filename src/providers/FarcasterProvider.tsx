'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// Type imports are safe - they don't execute code
type Context = any; // We'll use any for now since we import dynamically

interface FarcasterContextType {
    isSDKLoaded: boolean;
    isLoadingContext: boolean;
    context: Context | undefined;
}

const FarcasterContext = createContext<FarcasterContextType>({
    isSDKLoaded: false,
    isLoadingContext: true,
    context: undefined,
});

export const useFarcasterContext = () => useContext(FarcasterContext);

import { FarcasterAutoConnect } from '@/components/FarcasterAutoConnect';

export default function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [isLoadingContext, setIsLoadingContext] = useState(true);
    const [context, setContext] = useState<Context>();

    useEffect(() => {
        const loadContext = async () => {
            try {
                // Only attempt SDK loading if we're in a client environment with potential Farcaster context
                if (typeof window === 'undefined') {
                    console.log('⚠️ Server-side rendering detected, skipping SDK');
                    setContext(undefined);
                    setIsLoadingContext(false);
                    setIsSDKLoaded(true);
                    return;
                }

                // Check if we're inside a Farcaster iframe (miniapp context)
                const isInFarcaster = window.parent !== window ||
                    window.location.ancestorOrigins?.length > 0 ||
                    document.referrer.includes('farcaster') ||
                    document.referrer.includes('warpcast');

                if (!isInFarcaster) {
                    console.log('⚠️ Not in Farcaster context - browser mode');
                    setContext(undefined);
                    setIsLoadingContext(false);
                    setIsSDKLoaded(true);
                    return;
                }

                console.log('🔄 Loading Farcaster MiniApp SDK...');

                // Dynamically import SDK only when needed
                const { sdk } = await import('@farcaster/miniapp-sdk');

                // Load the context from the SDK
                const ctx = await sdk.context;
                console.log('✅ Farcaster Context Loaded:', ctx);

                if (ctx && ctx.user) {
                    setContext(ctx);
                    console.log('✅ Farcaster user detected:', ctx.user.fid);
                } else {
                    console.warn('⚠️ No Farcaster user found');
                    setContext(undefined);
                }

                // Signal that the app is ready to display
                await sdk.actions.ready();
                console.log('✅ MiniApp ready signal sent');

                setIsLoadingContext(false);
                setIsSDKLoaded(true);
            } catch (err) {
                // SDK not available - running in browser mode
                console.warn('⚠️ Farcaster SDK unavailable - browser mode');
                setContext(undefined);
                setIsLoadingContext(false);
                setIsSDKLoaded(true);
            }
        };

        if (!isSDKLoaded) {
            loadContext();
        }
    }, [isSDKLoaded]);

    return (
        <FarcasterContext.Provider value={{ isSDKLoaded, isLoadingContext, context }}>
            <FarcasterAutoConnect />
            {children}
        </FarcasterContext.Provider>
    );
}
