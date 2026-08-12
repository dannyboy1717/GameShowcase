# r8bit — App Store submission checklist

Everything left to ship. The code side is done; what remains is account setup,
metadata, and one round of on-device verification.

> Demo account credentials are **not** in this file on purpose — the repo may be
> public. They go into App Store Connect's App Review notes only.

---

## Already done

- [x] Bundle ID `com.danhug.r8bit`, `buildNumber` 1, app name `r8bit`
- [x] iPhone only — `supportsTablet: false`, so no iPad screenshots or iPad review
- [x] `usesNonExemptEncryption: false` — the export-compliance question never appears
- [x] `PrivacyInfo.xcprivacy` generated with 5 collected data types and 4 accessed APIs
- [x] Privacy policy live at the URL below, with a matching `r8bit` name
- [x] Real AdMob unit IDs wired, test IDs behind `__DEV__`
- [x] App icon 1024×1024 with no alpha channel (Apple rejects alpha)
- [x] `eas.json` created with a production profile
- [x] Account deletion in-app, for Guideline 5.1.1(v)

The GitHub repo is still named `RateBit`. That's deliberate — it keeps the
privacy policy URL stable. The repo name is never shown to users or Apple.

## 1. Apple Developer Program

- [ ] Enrol at [developer.apple.com/programs](https://developer.apple.com/programs) — £79/$99 per year, **24–48h to activate**. Start this first; everything else is blocked behind it.
- [ ] Check the name **r8bit** is free on the App Store. Names are globally unique and first-come.

## 2. Create the app record

App Store Connect → **My Apps** → **+** → New App.

- [ ] Platform: iOS
- [ ] Name: `r8bit`
- [ ] Primary language
- [ ] Bundle ID: `com.danhug.r8bit` — register it under **Certificates, Identifiers & Profiles** first if it isn't listed
- [ ] SKU: any internal string, e.g. `r8bit-001`

## 3. Build and upload

**EAS Build** (no Xcode signing to wrangle):
```bash
npx eas login
npx eas init          # links this project to your Expo account
npx eas build -p ios --profile production
npx eas submit -p ios
```

The production profile sets `autoIncrement`, so build numbers bump themselves —
App Store Connect rejects duplicate build numbers and this removes that failure
mode entirely.

**Or Xcode:** open `ios/r8bit.xcworkspace`, set your team under Signing &
Capabilities, then Product → Archive → Distribute App. If you go this route you
must bump `ios.buildNumber` in `app.json` manually on every upload.

## 4. App Privacy (nutrition labels)

App Store Connect → your app → **App Privacy**. These are separate from the
privacy manifest in the build and **must agree with it** — a mismatch is one of
the most common rejections. Declare exactly:

| Data | Linked to user | Used for tracking | Purpose |
|---|---|---|---|
| Email Address | Yes | No | App Functionality |
| User ID | Yes | No | App Functionality |
| Other User Content *(game library and notes)* | Yes | No | App Functionality |
| Device ID *(IDFA, via AdMob)* | No | **Yes** | Third-Party Advertising |
| Product Interaction | No | **Yes** | Third-Party Advertising |

- [ ] Answer **Yes** to "Do you or your third-party partners use data for tracking?" — you serve AdMob ads and prompt for ATT
- [ ] Privacy policy URL: `https://dannyboy1717.github.io/RateBit/privacy.html`

## 5. Age rating

- [ ] Complete the questionnaire — nothing in the app is objectionable, so answers are "None" throughout
- [ ] Answer **No** to unrestricted web access
- [ ] Declare third-party advertising where asked

## 6. Screenshots

iPhone only now, and Apple scales the largest size down to the rest.

- [ ] **6.9" iPhone** — 1320 × 2868 or 1290 × 2796

Capture from the simulator signed in as the demo account (`⌘S` saves to
Desktop). Good set: populated library with cover art, the sort/filter sheet
open, IGDB search mid-query, a game detail screen, the add form.

- [ ] **No ad visible in any screenshot** — Apple rejects marketing images featuring ads

## 7. Text

- [ ] **Description** — what it does and who it's for
- [ ] **Keywords** — 100 chars, comma-separated, no spaces: `game,backlog,tracker,library,collection,rate,gaming,videogame`
- [ ] **Support URL** — required. A page on danhug.com, or the GitHub repo
- [ ] **Marketing URL** — optional
- [ ] **Promotional text** — 170 chars, editable without shipping a new build

## 8. App Review notes — do not skip

The app is entirely behind a login, so a reviewer sees only a sign-in screen.
Apps get rejected for this constantly.

- [ ] Paste the demo email and password into **App Review Information → Sign-In Required**
- [ ] Add a note: *"Email confirmation is enabled on new accounts, so please use the demo account provided rather than registering. Account deletion is available under Account → Delete account."*

## 9. Verify on a real device before submitting

The AdMob native config was previously broken — the plugin props were being
silently discarded, so **ATT has never actually prompted on a real build**. That
path is fixed in config but unproven at runtime, and if ATT doesn't fire, the
privacy manifest declares tracking you have no consent for.

- [ ] Delete the app from the device first — iOS only shows the ATT prompt once per install
- [ ] Confirm the ATT prompt appears, and that it comes **after** the UMP consent form
- [ ] Confirm live ads render with the real unit IDs
- [ ] Confirm account deletion works end to end
- [ ] Sign in as the demo account on a clean install and check it looks right
- [ ] TestFlight the exact build you intend to ship

---

## Deferred

- `androidAppId` in `app.json` is still `REPLACE_ME`. The SDK **crashes at launch** on Android without a real one — irrelevant to the App Store, but Android is not a quick follow-on.
- `app-ads.txt` on a developer domain. Not a submission blocker, but without it most programmatic demand won't bid, which directly costs ad revenue.
