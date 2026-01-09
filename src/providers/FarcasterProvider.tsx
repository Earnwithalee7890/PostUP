'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';

// Infers the context type directly from the SDK, avoiding import errors
type FrameContext = Awaited<typeof sdk.context>;

interface FarcasterContextType {
    isSDKLoaded: boolean;
    isLoadingContext: boolean;
    context: FrameContext | undefined;
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
    const [context, setContext] = useState<FrameContext>();

    useEffect(() => {
        const loadContext = async () => {
            try {
                const ctx = await sdk.context;
                console.log('Farcaster Context Loaded:', ctx);

                if (!ctx) {
                    console.warn('⚠️ Farcaster context is undefined - running outside Farcaster app');
                    setContext(null);
                    return;
                }

                setContext(ctx);
            } catch (error) {
                console.error('Error loading Farcaster context:', error);
                setContext(null);
            } finally {
                setIsLoadingContext(false);
                sdk.actions.ready();
            }
        };
        if (sdk && !isSDKLoaded) {
            setIsSDKLoaded(true);
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
