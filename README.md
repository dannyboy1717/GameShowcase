# RateBit

A cross-platform mobile app for tracking and showcasing your video game library. Catalog the games you own, rate them, track your play status across platforms, and keep notes — all backed by your own account in the cloud.

Built with [Expo](https://expo.dev) / React Native and [Supabase](https://supabase.com).

## Features

- **Personal game library** — add, edit, and delete games, each scoped to your account.
- **Rich game metadata** — name, developer/publisher, platform, rating, play status, playtime, purchase date, cost, and free-form comments.
- **Play status tracking** — Plan to Play, Started, Finished, Completed, Continuous, Paused, or Dropped, each with its own color coding.
- **Star ratings** — 10-point scale rendered as 5 stars (with half stars).
- **Sort & filter** — native iOS menu pickers to sort by date added, A–Z, date started, date finished, or rating (ascending/descending), and filter by status.
- **Authentication** — email/password sign up and sign in via Supabase Auth, with sessions persisted on-device.
- **Multi-platform support** — track games across Xbox, PlayStation (PS1–PS5, Vita, PSP), Nintendo (Switch, Switch 2, 3DS, DS, GBA, SNES), and PC.
- **Liquid-glass UI** — custom glass-effect buttons and surfaces, with light/dark mode support.
- **Ads** — Google Mobile Ads (AdMob) integration.

## Tech stack

| Area | Technology |
|------|-----------|
| Framework | Expo SDK 54, React Native 0.81, React 19 |
| Routing | Expo Router (file-based, typed routes) |
| Styling | NativeWind / Tailwind CSS |
| Backend | Supabase (Postgres + Auth) |
| Language | TypeScript |
| Native UI | `@expo/ui` (SwiftUI), `expo-glass-effect`, `expo-blur` |
| Ads | `react-native-google-mobile-ads` |

## Project structure

```
GameShowcase/
├── app/                      # Expo Router routes
│   ├── (tabs)/               # Tab navigator (games, account)
│   ├── screens/              # add-game, edit-game, game-details
│   ├── lib/supabase.ts       # Supabase client
│   ├── types/                # Game / Database type definitions
│   └── _layout.tsx           # Root stack layout
├── components/               # UI components (pickers, glass buttons, etc.)
│   └── ui/                   # Glass surfaces, tab bar, icons
├── hooks/                    # useAuthSession, useGames, theming hooks
├── constants/                # Colors
├── assets/                   # Fonts and images
└── ios/                      # Native iOS project
```

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

## Backend

The app connects to a Supabase project. Game data lives in a `Games` table keyed by `user_id`, and authentication is handled by Supabase Auth. The client is configured in `app/lib/supabase.ts`.

> **Note:** To point the app at your own Supabase project, update `supabaseUrl` and `supabaseAnonKey` in `app/lib/supabase.ts`. The `Games` table should match the `Game` interface in `app/types/supabase.ts`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo dev server |
| `npm run ios` | Run on iOS |
| `npm run android` | Run on Android |
| `npm run web` | Run on web |
| `npm run lint` | Lint with Expo's ESLint config |
| `npm run reset-project` | Reset to a blank starter project |
