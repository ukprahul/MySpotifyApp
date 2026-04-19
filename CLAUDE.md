# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server (interactive: press i for iOS, a for Android, w for web)
npm run ios        # Launch iOS simulator directly
npm run android    # Launch Android emulator directly
npm run web        # Run in browser
npm run lint       # Run ESLint
npm run reset-project  # Wipe starter content and reset to blank state
```

No test framework is configured yet.

## Architecture

**Stack:** Expo ~54 + React Native 0.81 + TypeScript, targeting iOS, Android, and Web from a single codebase.

**Routing:** Expo Router (file-based, like Next.js). All screens live under `app/`:
- `app/_layout.tsx` — root Stack navigator + theme provider
- `app/(tabs)/_layout.tsx` — bottom tab bar (Home, Explore)
- `app/(tabs)/index.tsx` — Home screen
- `app/(tabs)/explore.tsx` — Explore screen
- `app/modal.tsx` — modal overlay

Adding a new screen = adding a file under `app/`. Typed routes are enabled (`typedRoutes: true` in `app.json`).

**Theming:** Light/dark mode via `constants/theme.ts` (color palette) + `useColorScheme()` hook + `ThemedText`/`ThemedView` wrapper components. All color values go through these — don't hardcode colors in screens.

**Key installed-but-unused libraries** (ready to build on):
- `react-native-track-player` — audio playback engine for the music player
- `expo-web-browser` — OAuth flows (Spotify auth)
- `react-native-reanimated` — GPU-accelerated animations

**Path alias:** `@/` maps to the project root (configured in `tsconfig.json`).

**No Spotify integration exists yet.** When adding it, environment variables (`SPOTIFY_CLIENT_ID`, `SPOTIFY_REDIRECT_URI`) should be loaded via `expo-constants` from `.env.local` — no `.env.example` exists yet.
