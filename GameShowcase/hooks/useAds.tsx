"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { bootstrapAds, maybeShowInterstitial } from "@/app/lib/ads";

type AdsContextType = {
    /**
     * True once consent is resolved and the SDK is initialized. Nothing should
     * render an ad before this, so the consent rules live in one place rather
     * than at every call site.
     */
    adsReady: boolean;
    maybeShowInterstitial: () => Promise<void>;
};

const AdsContext = createContext<AdsContextType | undefined>(undefined);

export function AdsProvider({ children }: { children: ReactNode }) {
    const [adsReady, setAdsReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        void bootstrapAds().then((ready) => {
            if (!cancelled) {
                setAdsReady(ready);
            }
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const value = useMemo<AdsContextType>(() => ({ adsReady, maybeShowInterstitial }), [adsReady]);

    return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAds(): AdsContextType {
    const context = useContext(AdsContext);

    if (!context) {
        throw new Error("useAds must be used within an AdsProvider");
    }

    return context;
}
