"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { bootstrapAds, maybeShowInterstitial } from "@/app/lib/ads";
import { useAuthSession } from "@/hooks/useAuthSession";

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
    const { user, loading: authLoading } = useAuthSession();

    useEffect(() => {
        // Deliberately gated on being signed in. Bootstrapping on mount would
        // put the consent form and the iOS tracking prompt in front of the
        // login screen, before the user has seen what the app does — which
        // wrecks opt-in rates and invites an App Store rejection for showing
        // ATT without context.
        if (authLoading || !user) {
            return;
        }

        let cancelled = false;

        void bootstrapAds().then((ready) => {
            if (!cancelled) {
                setAdsReady(ready);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [authLoading, user]);

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
