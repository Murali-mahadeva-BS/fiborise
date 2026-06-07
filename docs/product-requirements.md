# Fiborise Product Requirements

## Product Summary

Fiborise is a local-first mobile habit tracker for habits that should grow gradually and then be maintained. The core mechanic is a Fibonacci level system: the user chooses a baseline amount, and the app calculates daily targets from Fibonacci level values.

The product should feel calm, fast, and encouraging. Reports should emphasize done days and progress rather than missed days.

## Target Users

- People building physical, health, learning, or spiritual habits.
- Users who like structured progression but do not want a social or heavily gamified app.
- Users who want local data ownership before any future cloud account is introduced.

## Core Concepts

### Habit

A habit is a repeatable activity with a baseline amount and a free-text unit.

Examples:

- Running: `100 m`
- Surya namaskara: `2 rounds`
- Meditation: `5 min`
- Reading: `2 pages`
- Walking: `0.5 km`

### Level Ladder

The default sequence is `0, 1, 1, 2, 3, 5, 8, 13, ...`.

The app displays the Fibonacci value as the user's current level. Duplicate values are displayed as the same level. For example, both `1` entries display as `Level 1`, while the app tracks the internal sequence position.

Each sequence position has:

- `level`: the Fibonacci value for that position.
- `daily target`: `base amount * level`.
- `required done days`: `1` for level `0`, otherwise the level value.

Example for a `100 m` running baseline:

- Level 0: just mark done for `1` day.
- Level 1: run `100 m` for `1` done day.
- Level 1: run `100 m` for `1` done day.
- Level 2: run `200 m` for `2` done days.
- Level 3: run `300 m` for `3` done days.
- Level 5: run `500 m` for `5` done days.

### Completion

For the MVP, the user can mark only today's habit status.

Supported today states:

- `done`: user completed the planned target.
- `not done`: user did not complete the planned target.

Only `done` advances progress. Missing dates are treated as not done and are not stored as logs.

Once a local calendar day passes, that day is locked. The user cannot edit past dates in the MVP.

### Skipped Days

Skipped days do not advance progress and do not reset progress.

Recommended rule:

- On app launch, calculate missing past dates as locked not done.
- Do not store missed/not-done logs.
- Do not mark today not done until the user explicitly chooses not done or the day passes.
- Use the user's local calendar date for habit logs.

### Stay Mode

Stay mode freezes a habit at the current target so the user can maintain it without progressing to a harder level.

MVP behavior:

- User can toggle stay mode from the habit detail screen.
- While stay mode is on, the target amount stays fixed.
- Done days continue to count toward reports and streaks.
- Fibonacci level progress does not advance while stay mode is on.
- Turning stay mode off resumes growth from the same internal sequence position and prior progress.

### Archive And Delete

- Active habits can be archived.
- Archived habits stop reminders automatically.
- Archived habits are accessible from Settings.
- Archived habits can be restored from Settings.
- Habits cannot be deleted directly from the active habits list.
- Archived habits can be deleted after confirmation.

## User Stories

### Habit Creation

As a user, I can create a habit with a name, icon, decimal baseline amount, free-text unit, description, and optional reminder so I can start tracking it immediately.

Acceptance criteria:

- Start date defaults to today's local date.
- Base amount must be greater than zero and may be decimal.
- Unit is free text.
- Icon can be selected from a searchable built-in list of app icons and emojis.
- The first daily target is Level 0: just mark done.
- Habit appears on the home screen after creation.

### Daily Tracking

As a user, I can see today's target for each habit and mark it done or not done.

Acceptance criteria:

- Home screen shows active habits in creation order.
- Home screen shows today's target for each habit.
- Level 0 target is shown as a simple start action, not as `0 unit`.
- User can mark today's habit done.
- User can switch today's status between done and not done.
- Past dates are read-only.
- A date can have at most one done log per habit.
- Marking today not done removes today's done log if one exists.

### Progression

As a user, I advance to the next Fibonacci level position only after completing the current target enough times.

Acceptance criteria:

- Level progress increments only when today is marked done.
- Progress is based on total done days, not consecutive days.
- Skipped days do not reset progress.
- Skipped days do not increase the target.
- Level 0 requires one done day.
- Level 1 appears twice in sequence and each position requires one done day.
- Level 2 requires two done days, Level 3 requires three done days, and so on.

### Reminders

As a user, I can set a daily reminder time for each habit so I remember to complete it.

Acceptance criteria:

- Reminder can be enabled or disabled per habit.
- Reminder time can be changed.
- Notifications are local device notifications.
- Reminder copy includes habit name and today's target.
- Archived habits do not fire reminders.

### Reports

As a user, I can review my performance for each habit.

Acceptance criteria:

- Report shows total done days.
- Report shows current Level and target.
- Report shows current Level progress, for example `1 / 2 days at 200 m`.
- Report shows streak information.
- Report does not emphasize missed days.
- Report includes graphs for completion history and cumulative volume.

Required graphs:

- Calendar heatmap or monthly completion grid.
- Cumulative amount line chart with Level milestone dots.

Graph conventions:

- Week starts on Monday.
- Cumulative amount uses planned target amount for done days.
- Level 0 done day contributes `0` amount.

### Future Cloud Sync

As a future user, I should be able to log in on another device and access data created while the app was offline-only.

Acceptance criteria for MVP architecture:

- Local records have stable unique IDs.
- Local records have created and updated timestamps.
- Local schema is versioned through migrations.
- Done logs store the planned level and planned amount at the time of completion.
- Import/export is not required in the MVP.

## Non-Goals For MVP

- Cloud sync.
- Authentication.
- Import/export.
- Social features.
- Leaderboards.
- Paid subscriptions.
- Wearable integrations.
- Server backend.
- AI coaching.
- Pause mode.
- Editing past dates.
- Direct deletion of active habits.

## Resolved Decisions

- Use Level instead of Stage.
- Sequence starts at `0, 1, 1, 2, 3, 5...`.
- Duplicate `1` values both display as `Level 1`.
- User can only mark or change today's status.
- Past dates are read-only.
- Store only done logs.
- Missing dates are treated as not done.
- Reports focus on done/progress, not missed counts.
- Units are free text.
- Baseline amount can be decimal.
- Theme supports system, light, and dark modes.
- Import/export is skipped in MVP.
- Archived habits live in Settings.
