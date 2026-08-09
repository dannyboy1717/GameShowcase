import { Redirect } from "expo-router";

import { useAuthSession } from "@/hooks/useAuthSession";

// Ads initialization (consent -> ATT -> initialize) lives in hooks/useAds.tsx,
// mounted from app/_layout.tsx.

export default function Index() {
    const { user, loading } = useAuthSession();

    if (loading) {
        return null;
    }

    return <Redirect href={user ? "/games" : "/account"} />;
}
