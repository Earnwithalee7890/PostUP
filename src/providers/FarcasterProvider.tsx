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
        const load = async () => {
            try {
                const context = await sdk.context;
                console.log('Farcaster Context Loaded:', context);
                setContext(context);
            } catch (error) {
                console.error('Failed to load Farcaster context:', error);
            } finally {
                setIsLoadingContext(false);
                sdk.actions.ready();
            }
        };
        if (sdk && !isSDKLoaded) {
            setIsSDKLoaded(true);
            load();
        }
    }, [isSDKLoaded]);

    return (
        <FarcasterContext.Provider value={{ isSDKLoaded, isLoadingContext, context }}>
            <FarcasterAutoConnect />
            {children}
        </FarcasterContext.Provider>
    );
}
