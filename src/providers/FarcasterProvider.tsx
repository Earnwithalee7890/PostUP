'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import sdk, { type FrameContext } from '@farcaster/frame-sdk';

interface FarcasterContextType {
    isSDKLoaded: boolean;
    context: FrameContext | undefined;
}

const FarcasterContext = createContext<FarcasterContextType>({
    isSDKLoaded: false,
    context: undefined,
});

export const useFarcasterContext = () => useContext(FarcasterContext);

export default function FarcasterProvider({ children }: { children: React.ReactNode }) {
    const [isSDKLoaded, setIsSDKLoaded] = useState(false);
    const [context, setContext] = useState<FrameContext>();

    useEffect(() => {
        const load = async () => {
            const context = await sdk.context;
            setContext(context);
            sdk.actions.ready();
        };
        if (sdk && !isSDKLoaded) {
            setIsSDKLoaded(true);
            load();
        }
    }, [isSDKLoaded]);

    return (
        <FarcasterContext.Provider value={{ isSDKLoaded, context }}>
            {children}
        </FarcasterContext.Provider>
    );
}
