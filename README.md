# Fiborise

Fiborise is an offline-first habit tracker built with Expo and React Native.
It uses a Fibonacci-based level progression system to help users grow habits gently and maintain them with clear, local-first behavior.

## Why Fiborise

- Builds habits with a growth-first model based on the Fibonacci sequence.
- Uses only local storage and no backend or authentication for the MVP.
- Stores done days only; skipped days do not advance progress.
- Supports daily reminders, stay mode, habit archiving, and per-habit reports.

## Key features

- Fibonacci level progression with the sequence: `0, 1, 1, 2, 3, 5, 8, ...`
- Level 0 is a start action with no amount target.
- Level progress advances only when the user marks today done.
- Decimal baseline amounts and free-text units.
- Local SQLite storage with stable IDs, timestamps, and schema migrations.
- Reports for streaks, monthly completion grids, and cumulative volume with Level milestones.
- Android-first design with system, light, and dark theming.

## Tech stack

- Expo SDK 54
- React Native + TypeScript
- Expo Router
- NativeWind
- Zustand
- `expo-sqlite`
- `expo-notifications`
- `lucide-react-native`
- `react-native-gifted-charts`
- `zod`

## Repository structure

- `src/app/` — app screens and navigation
- `src/features/` — habits, reports, settings domain logic
- `src/lib/` — reusable utilities for levels, dates, storage, notifications, and reminders
- `src/store/` — global state management
- `docs/` — product requirements and technical planning

## Getting started

```bash
npm install
npm run start
```

Launch on Android:

```bash
npm run android
```

Run validation:

```bash
npm run lint
npm run typecheck
npm test
```

## Notes for contributors

This repo is public and intended for other developers to review and contribute.
Please read `docs/product-requirements.md` and `docs/technical-plan.md` before changing app behavior.

## License

This project is released under the MIT License. See `LICENSE`.
