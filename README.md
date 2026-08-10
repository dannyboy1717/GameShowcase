# RateBit

A cross-platform mobile app for tracking and showcasing your video game library. Catalog the games you own, rate them, track your play status across platforms, and keep notes — all backed by your own account in the cloud.

Built with [Expo](https://expo.dev) / React Native and [Supabase](https://supabase.com).

## Features

- **Personal game library** — add, edit, and delete games, each scoped to your account.
- **IGDB integration** — search Twitch's game database when adding a game, and get the canonical name, developer, platform, and box art filled in automatically. Games IGDB doesn't know about can still be added by hand.
- **Cover art** — box art on the library list and detail screen, cached on-device.
- **Rich game metadata** — name, developer/publisher, platform, rating, play status, playtime, purchase date, cost, and free-form comments.
- **Play status tracking** — Plan to Play, Started, Finished, Completed, Continuous, Paused, or Dropped, each with its own color coding.
- **Star ratings** — 10-point scale rendered as 5 stars (with half stars).
- **Sort & filter** — a single sheet to sort by date added, A–Z, date started, date finished, or rating (ascending/descending), and filter by status.
- **Authentication** — email/password sign up and sign in via Supabase Auth, with sessions persisted on-device and in-app account deletion.
- **Multi-platform support** — track games across Xbox, PlayStation (PS1–PS5, Vita, PSP), Nintendo (Switch, Switch 2, 3DS, DS, GBA, SNES), and PC.
- **Liquid-glass UI** — custom glass-effect buttons and surfaces, with light/dark mode support.
- **Ads** — AdMob banner and frequency-capped interstitial, behind UMP consent and App Tracking Transparency.

## Tech stack

| Area | Technology |
|------|-----------|
| Framework | Expo SDK 54, React Native 0.81, React 19 |
| Routing | Expo Router (file-based, typed routes) |
| Styling | NativeWind / Tailwind CSS |
| Backend | Supabase (Postgres + Auth + Edge Functions) |
| Language | TypeScript |
| Game data | [IGDB](https://api-docs.igdb.com/) via Twitch |
| Native UI | `expo-glass-effect`, `expo-blur`, `expo-image` |
| Ads | `react-native-google-mobile-ads` |

## Project structure

```
GameShowcase/                 # app source (Expo project root)
├── app/                      # Expo Router routes
│   ├── (tabs)/               # games list, account
│   ├── screens/              # search-game, add-game, edit-game, game-details
│   ├── lib/                  # supabase, igdb, ads clients
│   ├── types/                # Game / Database type definitions
│   └── _layout.tsx           # root layout and providers
├── components/               # UI components (pickers, sheet, glass buttons)
│   └── ui/                   # glass surfaces, icons
├── hooks/                    # useAuthSession, useGames, useAds, useToast
├── scripts/                  # backfill-igdb.mjs
├── supabase/
│   ├── functions/            # igdb-search, delete-account
│   └── migrations/           # schema and RLS policies
├── assets/                   # fonts and images
└── ios/                      # generated native project (not tracked)
docs/                         # privacy policy, published via GitHub Pages
```

State lives in three providers mounted in `app/_layout.tsx`: `AuthSessionProvider` (one auth subscription for the whole app), `GamesProvider` (the library, and every read/write to it), and `AdsProvider` (consent, initialization, interstitial pacing).

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- The [Expo CLI](https://docs.expo.dev/) (via `npx`)
- For iOS builds: Xcode and CocoaPods (macOS)

### Install

```bash
cd GameShowcase
npm install
```

### Run

```bash
npm start        # start the Expo dev server
npm run ios      # build & run on iOS simulator/device
npm run android  # build & run on Android
npm run web      # run in the browser
```

> **Note:** `@expo/ui` and `expo-glass-effect` are not bundled in Expo Go, so the app needs a development build rather than the Expo Go client to render correctly.

## Backend

The app connects to a Supabase project. Game data lives in a `Games` table keyed by `user_id`, protected by row-level security scoped to `auth.uid()`, and authentication is handled by Supabase Auth. The client is configured in `app/lib/supabase.ts`.

Two Edge Functions hold credentials that must never reach the app bundle:

| Function | Purpose |
|---|---|
| `igdb-search` | Proxies game searches to IGDB. Holds the Twitch client secret and caches the access token. Also works around IGDB sending no CORS headers, which would break the web build. |
| `delete-account` | Deletes the calling user and their games. Needs the service-role key, so it cannot run client-side. |

Deploy them with:

```bash
npx supabase functions deploy igdb-search --project-ref <your-project-ref>
npx supabase functions deploy delete-account --project-ref <your-project-ref>
npx supabase secrets set --env-file supabase/.env --project-ref <your-project-ref>
```

> **Note:** To point the app at your own Supabase project, update `supabaseUrl` and `supabaseAnonKey` in `app/lib/supabase.ts`. Apply the SQL in `supabase/migrations/` so the schema and RLS policies match.

## Ads

Ad unit IDs live in `app/lib/ads.ts` and fall back to Google's test IDs whenever `__DEV__` is true, so development builds never serve or click live ads. The AdMob app ID, tracking usage description, and SKAdNetwork IDs are configured as `react-native-google-mobile-ads` plugin props in `app.json` and applied by `npx expo prebuild`.

Consent runs before anything is requested: UMP consent → App Tracking Transparency → SDK initialization, and only once the user is signed in, so the prompts never appear over the login screen.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo dev server |
| `npm run ios` | Run on iOS |
| `npm run android` | Run on Android |
| `npm run web` | Run on web |
| `npm run lint` | Lint with Expo's ESLint config |
| `node scripts/backfill-igdb.mjs` | Interactively match pre-IGDB games to IGDB entries (`--dry-run`, `--limit N`) |
