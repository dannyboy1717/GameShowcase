# RateBit — App Store submission checklist

Everything left to ship. Code-side work is done; this is account, metadata and
build setup.

> Demo account credentials are **not** in this file on purpose — the repo may be
> public. They go into App Store Connect's App Review notes only.

---

## 1. Decide on iPad first — it changes the work

`app.json` currently has `ios.supportsTablet: true`. That means Apple requires
**iPad screenshots** and will review the app on an iPad. The UI is built for
phones, so unless you want to test and polish an iPad layout, set it to
`false` and re-run `npx expo prebuild --clean -p ios`.

Doing this first avoids producing screenshots you then throw away.

## 2. Apple Developer Program

- [ ] Enrol at [developer.apple.com/programs](https://developer.apple.com/programs) — £79/$99 per year, and it can take 24–48h to activate.
- [ ] Check the name **RateBit** is free on the App Store. App names are globally unique and first-come; if it's taken you need a different one and it's better to know now.

## 3. Create the app record

App Store Connect → **My Apps** → **+** → New App.

- [ ] Platform: iOS
- [ ] Name: `RateBit`
- [ ] Primary language
- [ ] Bundle ID: `com.danhug.RateBit` — register it under **Certificates, Identifiers & Profiles** first if it isn't listed
- [ ] SKU: any internal string, e.g. `ratebit-001`

## 4. Set up a build pipeline

No `eas.json` exists yet. Either route works:

**EAS Build (no Xcode wrangling):**
```bash
npx eas login
npx eas build:configure
npx eas build -p ios --profile production
npx eas submit -p ios
```

**Xcode:** open `ios/RateBit.xcworkspace`, pick your team under Signing &
Capabilities, then Product → Archive → Distribute App.

- [ ] Bump `ios.buildNumber` in `app.json` for **every** upload — App Store Connect rejects duplicates.

## 5. Skip the export-compliance question forever

The app only uses HTTPS, which is exempt. Add to `app.json` under `expo.ios` so
you aren't asked on every single upload:

```json
"config": { "usesNonExemptEncryption": false }
```

- [ ] Add it, then `npx expo prebuild --clean -p ios`

## 6. App Privacy (nutrition labels)

App Store Connect → your app → **App Privacy**. These are separate from the
`PrivacyInfo.xcprivacy` in the build and must match it. Declare exactly:

| Data | Linked to user | Used for tracking | Purpose |
|---|---|---|---|
| Email Address | Yes | No | App Functionality |
| User ID | Yes | No | App Functionality |
| Other User Content *(the game library and notes)* | Yes | No | App Functionality |
| Device ID *(IDFA, via AdMob)* | No | **Yes** | Third-Party Advertising |
| Product Interaction | No | **Yes** | Third-Party Advertising |

- [ ] Answer **Yes** to "Do you or your third-party partners use data for tracking?" — you show AdMob ads and prompt for ATT.
- [ ] Privacy policy URL: `https://dannyboy1717.github.io/RateBit/privacy.html`

Getting this wrong is a common rejection, and it must agree with the privacy
manifest already in the build.

## 7. Age rating

- [ ] Complete the questionnaire. Nothing in the app is objectionable, so answers are "None" throughout.
- [ ] Answer **No** to unrestricted web access.
- [ ] Declare that the app contains third-party advertising where asked.

## 8. Screenshots

Apple scales one size down to the rest, so you need the largest only.

- [ ] **6.9" iPhone** — 1320 × 2868 or 1290 × 2796
- [ ] **13" iPad** — only if you kept `supportsTablet: true`

Capture from the simulator with the demo account signed in (`⌘S` saves to
Desktop). Good set: populated library with covers, the sort/filter sheet open,
IGDB search mid-query, a game detail screen, the add form.

- [ ] Make sure **no ad is visible** in any screenshot — Apple rejects marketing images that feature ads.

## 9. Text

- [ ] **Description** — what it does and who it's for
- [ ] **Keywords** — 100 chars, comma-separated, no spaces: `game,backlog,tracker,library,collection,rate,gaming,videogame`
- [ ] **Support URL** — required. A page on danhug.com, or the GitHub repo
- [ ] **Marketing URL** — optional
- [ ] **Promotional text** — 170 chars, editable without a new build

## 10. App Review notes — do not skip

The app is entirely behind a login, so a reviewer sees only a sign-in screen.
Apps get rejected for this constantly.

- [ ] Paste the demo account email and password into **App Review Information → Sign-In Required**
- [ ] Add a note: *"Email confirmation is enabled on new accounts, so please use the demo account provided rather than registering. Account deletion is available under Account → Delete account."*

Reviewers specifically look for account deletion (Guideline 5.1.1(v)) — telling
them where it is speeds things up.

## 11. Before you hit submit

- [ ] Build on a real device and confirm the ATT prompt appears (delete the app first — iOS only asks once per install)
- [ ] Confirm live ads render with the real ad unit IDs
- [ ] Confirm account deletion works end to end
- [ ] Sign in as the demo account on a clean install and check it looks right
- [ ] TestFlight the exact build you intend to ship

---

## Deferred

- `android_app_id` in `app.json` is still `REPLACE_ME`. Android crashes on launch without a real one — only matters when you ship Android.
- `app-ads.txt` on a developer domain. Not a submission blocker, but without it most programmatic demand won't bid, which directly costs ad revenue.
