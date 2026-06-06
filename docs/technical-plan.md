# Fiborise Technical Plan

## Recommended Stack

- App framework: React Native with Expo SDK 54 and TypeScript.
- Navigation: Expo Router.
- Styling: NativeWind.
- UI components: custom in-repo components.
- Icons: lucide-react-native.
- Storage: local SQLite through Expo.
- Notifications: Expo Notifications.
- Forms: React Hook Form with Zod validation.
- State management: Zustand.
- Charts: React Native Gifted Charts for bar and line charts, with custom calendar heatmap and Level timeline.
- Testing: Jest, React Native Testing Library, and focused pure unit tests for the Level engine.
- Android validation: Expo development build or Android emulator first; iOS later.

Why this stack:

- Expo keeps Android-first development fast while preserving an iOS path.
- SDK 54 is used for now because Expo Go for SDK 56 is not available through the Play Store/App Store during the SDK 56 transition window.
- SQLite matches the local-first requirement and makes future cloud migration predictable.
- NativeWind and custom components avoid a Material Design look while keeping styling fast to iterate.
- Zustand gives simple global state without Redux-level boilerplate.
- Gifted Charts covers the MVP report bar and line charts without the heavier setup of Skia-based charting.
- Keeping Level logic in pure TypeScript makes Codex and tests much more reliable.

## Suggested Project Structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    onboarding.tsx
    settings.tsx
    habits/
      new.tsx
      [id].tsx
  components/
    ui/
  features/
    habits/
    onboarding/
    reports/
    settings/
  lib/
    levels/
    dates/
    storage/
    notifications/
  store/
  theme/
  test/
docs/
```

## Core Domain Model

### Habit

```ts
type Habit = {
  id: string;
  name: string;
  icon: string;
  description?: string;
  baseAmount: number;
  unit: string;
  startDate: string; // local YYYY-MM-DD
  reminderEnabled: boolean;
  reminderTime?: string; // HH:mm
  stayModeEnabled: boolean;
  stayModeLevelSequencePosition?: number;
  stayModeLevel?: number;
  stayModeTargetAmount?: number;
  stayModeDoneDaysInLevel?: number;
  archivedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};
```

### Habit Log

Only done days are stored.

```ts
type HabitLog = {
  id: string;
  habitId: string;
  localDate: string; // YYYY-MM-DD
  levelSequencePosition: number;
  level: number;
  plannedAmount: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};
```

### App Settings

```ts
type AppSettings = {
  onboardingCompletedAt?: string;
  weekStartsOn: "monday";
  createdAt: string;
  updatedAt: string;
};
```

## Level Engine

Put this logic in `src/lib/levels/` and cover it with unit tests before UI polish.

Required pure functions:

- `getLevelForSequencePosition(position): number`
- `getRequiredDoneDays(level): number`
- `getTargetAmount(baseAmount, level): number`
- `getCurrentLevelProgress(doneLogs, habit, today): LevelProgress`
- `getTodayTarget(habit, doneLogs, today): Target`
- `canEditDate(localDate, today): boolean`
- `buildDoneLog(habit, doneLogs, today): HabitLog`

Default rules:

- Level sequence is `0, 1, 1, 2, 3, 5, 8, ...`.
- Display the sequence value as the Level.
- Level 0 requires one done day and has no amount target.
- Any level above 0 requires `level` done days.
- Progress advances only from done logs.
- Calendar skips do not reset progress.
- Missing dates are treated as not done.
- Past dates are read-only.
- Stay mode returns the frozen target and does not advance Level progress.

## Storage Plan

Use SQLite tables with explicit migrations:

- `habits`
- `habit_logs`
- `app_settings`
- `schema_migrations`

Important constraints:

- Unique index on `(habit_id, local_date)` for logs.
- Store only done logs.
- Store dates as local `YYYY-MM-DD` strings for habit calendars.
- Store timestamps as ISO strings.
- Use stable IDs so local data can later sync to a remote database.
- Keep SQLite access behind repository/service modules.
- Avoid deriving product behavior directly inside screens.

## Future Sync Plan

Import/export is not part of the MVP. Instead, the local data model should support a later online account flow:

1. User uses the app offline with local SQLite.
2. Later app update adds login and cloud sync.
3. On first login, the app uploads local habits, settings, and done logs.
4. Other devices fetch the synced data after login.

MVP requirements that make this possible:

- Stable UUID-style IDs for local rows.
- Created and updated timestamps.
- Soft archive/delete timestamps for habits.
- Versioned SQLite migrations.
- Done logs store the planned level and amount at completion time.

## Screens

### Onboarding

- Short explanation of Levels.
- Short explanation that the app is local-first.
- Continue to create first habit.
- Skip option.

### Home

- Active habits list in creation order.
- Today's target for each habit.
- Done/not done quick action for today.
- Visual indication for completed today.

### Habit Detail

- Current target.
- Level progress.
- Stay mode toggle.
- Done history.
- Reminder settings shortcut.
- Reports shortcut.
- Archive action.

### Create/Edit Habit

- Name.
- Icon.
- Base amount.
- Free-text unit.
- Description/notes.
- Reminder toggle and time.

### Reports

- Total done days.
- Current Level and target.
- Level progress.
- Streaks.
- Calendar heatmap or monthly completion grid.
- Weekly done bar chart.
- Cumulative amount line chart.
- Level timeline.

### Settings

- Theme follows system by default.
- Archived habits.
- Delete archived habit after confirmation.
- About/local storage info.

## Milestones

### Milestone 1: Scaffold And Level Engine

- Create Expo TypeScript app.
- Add lint, format, test, and typecheck scripts.
- Implement Level progression engine.
- Add unit tests for Levels, skips, read-only past dates, and stay mode.

### Milestone 2: Local Storage

- Add SQLite setup and migrations.
- Add habit repository.
- Add done-log repository.
- Add sync-ready IDs/timestamps.

### Milestone 3: Habit Tracking UI

- Add theme, navigation, and onboarding.
- Add create/edit habit flow.
- Add today's done/not done interactions.
- Add habit detail screen.
- Add archive flow.

### Milestone 4: Reminders And Reports

- Add per-habit daily notification scheduling.
- Add report calculations.
- Add charts.
- Add archived habits settings screen.

### Milestone 5: Android Polish

- Test on Android emulator/device.
- Improve empty states, loading states, and error states.
- Validate dark/light theme.
- Prepare first internal build.

## Verification Commands

These should exist after scaffolding:

```bash
npm run lint
npm run typecheck
npm test
npm run android
```

Codex should run the relevant subset after each change and report any command it could not run.
