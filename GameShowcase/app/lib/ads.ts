import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform } from "react-native";
import mobileAds, { AdEventType, AdsConsent, InterstitialAd, TestIds } from "react-native-google-mobile-ads";
import { PERMISSIONS, RESULTS, check, request } from "react-native-permissions";

/**
 * Test IDs in development so we never serve — or click — a live ad against our
 * own account, which is what gets AdMob accounts suspended.
 *
 * TODO: replace the placeholders with real unit IDs from the AdMob console.
 * They're deliberately obvious so a production build fails loudly rather than
 * silently serving nothing.
 */
export const AD_UNITS = {
    banner: __DEV__ ? TestIds.BANNER : "ca-app-pub-9221208917509978/8520671154",
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : "ca-app-pub-9221208917509978/4521716399",
};

const COMPLETED_ADDS_KEY = "ads:completedAdds";
const LAST_INTERSTITIAL_KEY = "ads:lastInterstitialAt";

/** Show an interstitial on every Nth completed add, so the 1st and 2nd are free. */
const ADDS_PER_INTERSTITIAL = 3;
/** Floor on the gap between full-screen ads, regardless of the add count. */
const MIN_INTERSTITIAL_GAP_MS = 90_000;

let interstitial: InterstitialAd | null = null;
let adsInitialized = false;

/** How long to wait for the foreground before giving up on the ATT prompt. */
const ACTIVE_WAIT_TIMEOUT_MS = 10_000;

/**
 * Waits for the app to be foregrounded — iOS discards an ATT prompt otherwise.
 *
 * Resolves false if the app never becomes active within the timeout, so a
 * launch that happens in the background can't leave bootstrap pending forever
 * with a dangling AppState subscription.
 */
function waitForActive(): Promise<boolean> {
    if (AppState.currentState === "active") {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        const finish = (didBecomeActive: boolean) => {
            clearTimeout(timer);
            subscription.remove();
            resolve(didBecomeActive);
        };

        const timer = setTimeout(() => finish(false), ACTIVE_WAIT_TIMEOUT_MS);

        const subscription = AppState.addEventListener("change", (state) => {
            if (state === "active") {
                finish(true);
            }
        });
    });
}

/**
 * Gathers consent, prompts for ATT, then initializes the SDK — in that order.
 *
 * The order is required: consent has to be resolved before the SDK starts
 * requesting ads, and on iOS the ATT prompt belongs after the consent form so
 * users aren't hit with two dialogs in an arbitrary sequence.
 *
 * Never throws. Ads are additive, so any failure here has to leave the rest of
 * the app working — it just means no ads this session.
 */
export async function bootstrapAds(): Promise<boolean> {
    if (adsInitialized) {
        return true;
    }

    try {
        // A no-op outside consent regions (EEA/UK/CH); shows the UMP form where required.
        let canRequestAds = false;

        try {
            const consentInfo = await AdsConsent.gatherConsent();
            canRequestAds = consentInfo.canRequestAds;
        } catch (err) {
            // Commonly "no configured form(s)" when consent messages haven't been
            // published in the AdMob console yet. Fall back to the status the SDK
            // retained from a previous session rather than assuming consent — outside
            // consent regions that still resolves to true, but in the EEA/UK it
            // correctly withholds ads.
            console.warn("Consent gathering failed, falling back to stored status:", err);

            try {
                const storedInfo = await AdsConsent.getConsentInfo();
                canRequestAds = storedInfo.canRequestAds;
            } catch (infoErr) {
                console.warn("Could not read stored consent status, not requesting ads:", infoErr);
            }
        }

        if (!canRequestAds) {
            return false;
        }

        if (Platform.OS === "ios" && (await waitForActive())) {
            const status = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);

            // Only DENIED means "not asked yet" here; GRANTED/BLOCKED/LIMITED are all
            // settled answers and re-requesting would do nothing. If the app never
            // came to the foreground we skip the prompt and still initialize —
            // ads just stay non-personalized until we can ask.
            if (status === RESULTS.DENIED) {
                await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
            }
        }

        await mobileAds().initialize();
        adsInitialized = true;

        preloadInterstitial();
        return true;
    } catch (err) {
        console.warn("Ads failed to initialize:", err);
        return false;
    }
}

/**
 * Loads an interstitial ahead of time. Google is explicit that ads should be
 * loaded in advance and never shown from the load callback.
 */
export function preloadInterstitial() {
    if (!adsInitialized || interstitial) {
        return;
    }

    interstitial = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);

    // Reload after each dismissal so the next eligible moment has one ready.
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        interstitial?.load();
    });

    interstitial.addAdEventListener(AdEventType.ERROR, (err) => {
        console.warn("Interstitial failed to load:", err);
    });

    interstitial.load();
}

async function readNumber(key: string): Promise<number> {
    const raw = await AsyncStorage.getItem(key);
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Records a completed add and shows an interstitial only if every condition
 * holds: past the first couple of adds, on the Nth, enough time since the last
 * full-screen ad, and an ad actually loaded.
 *
 * Counters live in AsyncStorage so the cap survives restarts rather than
 * resetting to "show an ad" every launch.
 */
export async function maybeShowInterstitial(): Promise<void> {
    try {
        // Don't accrue count while ads are switched off — otherwise a user who
        // declined consent builds up a tally and gets an ad on their very next
        // add if they later accept.
        if (!adsInitialized) {
            return;
        }

        const completedAdds = (await readNumber(COMPLETED_ADDS_KEY)) + 1;
        await AsyncStorage.setItem(COMPLETED_ADDS_KEY, String(completedAdds));

        if (completedAdds % ADDS_PER_INTERSTITIAL !== 0) {
            return;
        }

        const lastShownAt = await readNumber(LAST_INTERSTITIAL_KEY);
        if (Date.now() - lastShownAt < MIN_INTERSTITIAL_GAP_MS) {
            return;
        }

        if (!interstitial?.loaded) {
            // Nothing to show, so give the count back rather than burning this
            // slot and making the user wait another full cycle.
            await AsyncStorage.setItem(COMPLETED_ADDS_KEY, String(completedAdds - 1));
            return;
        }

        await interstitial.show();
        await AsyncStorage.setItem(LAST_INTERSTITIAL_KEY, String(Date.now()));
    } catch (err) {
        // A failed ad must never block the user from finishing what they were doing.
        console.warn("Could not show interstitial:", err);
    }
}
