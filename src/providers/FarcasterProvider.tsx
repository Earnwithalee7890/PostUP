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

export default function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [isLoadingContext, setIsLoadingContext] = useState(true);
    const [context, setContext] = useState<Context>();

    useEffect(() => {
        const loadContext = async () => {
            try {
                // Server-side check
                if (typeof window === 'undefined') {
                    console.log('⚠️ Server-side rendering detected, skipping SDK');
                    setContext(undefined);
                    setIsLoadingContext(false);
                    setIsSDKLoaded(true);
                    return;
                }

                console.log('🔄 Loading Farcaster MiniApp SDK...');

                // Always try to load SDK - it will gracefully fail if not in miniapp
                const { sdk } = await import('@farcaster/miniapp-sdk');

                // Load the context from the SDK
                const ctx = await sdk.context;
                console.log('✅ Farcaster Context Loaded:', ctx);

                if (ctx && ctx.user) {
                    setContext(ctx);
                    console.log('✅ Farcaster user detected:', ctx.user.fid, ctx.user.username);
                } else {
                    console.warn('⚠️ No Farcaster user found in context');
                    setContext(undefined);
                }

                setIsLoadingContext(false);
                setIsSDKLoaded(true);
            } catch (err) {
                // SDK not available - running in browser mode
                console.warn('⚠️ Farcaster SDK unavailable - browser mode', err);
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
            {children}
        </FarcasterContext.Provider>
    );
}
