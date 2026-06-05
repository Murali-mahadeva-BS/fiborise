# Fiborise

Fiborise is an offline-first mobile habit tracker that helps people grow and maintain habits through a Fibonacci-based level system.

The app starts with a very small first-day action, then grows the daily target using Fibonacci level values. Progress advances only when the user marks a day done.

## Level System

The default level sequence is:

```text
0, 1, 1, 2, 3, 5, 8, 13, ...
```

Example with a running baseline of `100 m`:

| Sequence position | Displayed level | Daily target | Done days required |
| ---: | ---: | ---: | ---: |
| 0 | 0 | Just mark done | 1 |
| 1 | 1 | 100 m | 1 |
| 2 | 1 | 100 m | 1 |
| 3 | 2 | 200 m | 2 |
| 4 | 3 | 300 m | 3 |
| 5 | 5 | 500 m | 5 |

Duplicate Fibonacci values are shown naturally. Both `1` entries display as `Level 1`, while the app tracks their sequence positions internally.

Skipped days do not advance progress. Once a local calendar day passes, it is locked as not done. The user can only mark or change today's status.

## MVP Scope

- Create and manage multiple habits.
- Set a habit name, icon, baseline amount, free-text unit, description, and optional notes.
- Allow decimal baseline amounts, such as `0.5 km`.
- Start each habit on the day it is created.
- Show a short onboarding experience for first-time users.
- Mark today's habit target as done or not done.
- Store only done logs; missing dates are treated as not done.
- Keep progress based on total done days, not consecutive days.
- Support stay mode, which freezes a habit at the current target for maintenance.
- Configure local daily reminders per habit.
- Include the habit target in reminder text.
- Show per-habit reports focused on done days, current level, level progress, streaks, calendar heatmap, weekly done bars, cumulative amount, and level timeline.
- Archive habits; archived habits stop reminders and can be deleted from Settings.
- Support Android first, then iOS.
- Use system light/dark theme by default.
- Keep the app local-only for the MVP, with no authentication.
- Skip import/export in the MVP, but keep the local data model ready for future cloud sync.

## Proposed Tech Direction

- React Native with Expo and TypeScript.
- Expo Router for navigation.
- NativeWind for styling.
- Custom in-repo UI components for a non-Material visual direction.
- Zustand for app state.
- Local SQLite storage through Expo.
- Expo Notifications for local reminders.
- React Native Gifted Charts for report bar and line charts.
- Sync-ready local IDs, timestamps, and schema migrations for future login/cloud support.

See [docs/product-requirements.md](docs/product-requirements.md) for the refined product requirements and [docs/technical-plan.md](docs/technical-plan.md) for the build plan.

## Codex Workflow

This repository includes [AGENTS.md](AGENTS.md) and [docs/codex-workflow.md](docs/codex-workflow.md) so Codex in VS Code, the CLI, or the Codex app can start with the same product and engineering expectations.
