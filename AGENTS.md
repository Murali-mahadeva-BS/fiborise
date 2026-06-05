# AGENTS.md

## Project Intent

Fiborise is an offline-first React Native mobile app for habit growth and maintenance using Fibonacci-based progression.

Before implementing product behavior, read:

- `README.md`
- `docs/product-requirements.md`
- `docs/technical-plan.md`

## Current Status

The repository is in planning/setup state. Do not assume the React Native app has already been scaffolded.

## Collaboration Model

- The user is the Product Manager and final reviewer.
- Codex is responsible for implementation, testing, documentation updates, and technical review.
- Before making code, documentation, configuration, dependency, or Git changes, ask for user approval.
- Before implementing a requirement, ask clarifying questions when product behavior is ambiguous.
- State assumptions explicitly and keep them short so the user can correct them.
- Keep conversation concise to preserve context.
- Do not commit, push, merge, create a pull request, install dependencies, or run broad destructive actions without explicit approval.
- Commit regularly after meaningful approved changes, but ask for approval before each commit.

## Product Rules

- Use Level terminology, not Stage terminology.
- Default Level sequence is `0, 1, 1, 2, 3, 5, 8, 13, ...`.
- Daily target is `habit.baseAmount * currentLevel`.
- Level 0 is shown as a start action with no amount target and requires one done day.
- Levels above 0 require `currentLevel` done days.
- Only done logs advance Level progress.
- Store only done logs; missing dates are treated as not done.
- Past dates are read-only; the user can only mark or change today's status.
- Stay mode freezes the current target and prevents Level progression while enabled.
- Reports should emphasize done days and progress, not missed days.
- Archived habits stop reminders and can be deleted from Settings.
- MVP is local-only with no auth, backend, social features, or cloud sync.
- Import/export is not part of the MVP, but the local data model should be ready for future cloud sync.

## Engineering Preferences

- Use TypeScript.
- Prefer Expo-managed React Native APIs where practical.
- Keep domain logic pure and testable.
- Keep SQLite access behind repository/service modules.
- Store habit calendar dates as local `YYYY-MM-DD` strings.
- Store timestamps as ISO strings.
- Use stable IDs and schema migrations so local data can later sync to a remote database.
- Update docs when product rules or architecture decisions change.

## UI Expectations

- Android first, iOS compatible.
- Support system light/dark theme.
- Use NativeWind for styling.
- Build custom in-repo UI components instead of using Material Design components.
- Use lucide-react-native icons when practical.
- Avoid marketing-style landing pages; build the actual app screens.
- Keep controls accessible, fast, and clear.

## Verification

After scaffolding, prefer these checks:

```bash
npm run lint
npm run typecheck
npm test
```

Run `npm run android` when validating emulator/device behavior.

If a command does not exist yet, either add it as part of setup or report that the project has not been scaffolded.

## Git And Review

- Check `git status` before making broad edits.
- Preserve user changes.
- Keep changes scoped to the current task.
- Do not commit, push, merge, or create a pull request unless explicitly approved.
- For reviews, prioritize bugs, product-rule mismatches, missing tests, data-loss risks, and dependency risks.
