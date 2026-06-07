# Codex Workflow For Fiborise

## Best Surface To Use

Recommended setup: use Codex in VS Code as the main implementation surface, and use the Codex app for larger planning, review, worktree, and parallel tasks.

The working relationship for this project is Product Manager plus implementation agent:

- User owns requirements, product decisions, and acceptance review.
- Codex owns implementation, tests, technical choices, and technical review.
- Codex asks clarifying questions before implementing ambiguous requirements.
- Codex states assumptions explicitly before making changes.
- Codex asks for approval before code, documentation, configuration, dependency, and Git changes.
- Codex asks for approval before each commit.
- Codex keeps responses concise unless deeper analysis is requested.

Use VS Code/Codex when:

- You are actively editing screens, components, tests, and app logic.
- You want Codex to use the files currently open in the editor as context.
- You want fast local feedback from the terminal and emulator.

Use the Codex app when:

- You want a bigger planning conversation.
- You want to run a task in a Git worktree without touching your local checkout.
- You want the review pane, inline diff comments, app-managed commits, pushes, or PR creation.
- You want to delegate a larger task to cloud and come back to review it later.

## Required Repo Setup

This repository is initialized with Git. Codex review, worktrees, merging, and branch-based workflows are much better when the project is version-controlled.

```bash
git add README.md AGENTS.md docs .codex .gitignore
git commit -m "Document Fiborise requirements and Codex workflow"
```

After the app is scaffolded, create feature branches for meaningful work:

```bash
git switch -c feature/progression-engine
```

## Project Codex Config

This repo includes `.codex/config.toml` with conservative defaults:

- workspace write access
- approval prompts for actions that leave the sandbox
- cached web search
- medium reasoning by default
- no command network access by default

Keep this default most of the time. Temporarily allow network access only when installing or updating dependencies.

Example one-off CLI override for dependency installation:

```bash
codex -c sandbox_workspace_write.network_access=true "Install the Expo dependencies required by the technical plan, then run the scaffold verification commands."
```

In VS Code, use the permission selector under the chat input:

- Use `Agent` for normal local implementation.
- Use `Chat` or Plan mode for requirements and architecture discussions.
- Use `Agent (Full Access)` only for trusted, bounded tasks where you intentionally want broad filesystem and network access.

## How To Prompt Codex

Use this shape for most implementation tasks:

```text
Goal:
Build the Fibonacci progression engine for Fiborise.

Context:
Read @docs/product-requirements.md, @docs/technical-plan.md, and @AGENTS.md first.

Constraints:
Keep the logic pure TypeScript. Do not build UI yet. Follow the default sequence 1, 2, 3, 5...

Done when:
Progression, missed days, and stay mode have unit tests, and npm test passes.
```

For this repo, Codex should normally respond first with:

- Clarifying questions, if needed.
- A short understanding of the requirement.
- Explicit assumptions.
- The files it expects to change.
- A request for approval before editing.

For ambiguous tasks, start with:

```text
Use plan mode. Interview me about the open product decisions in @docs/product-requirements.md, then update the requirements doc with the decisions we make. Do not scaffold app code yet.
```

For reviews:

```text
/review
Review the uncommitted changes against @docs/product-requirements.md and @AGENTS.md. Prioritize bugs, product rule mismatches, missing tests, and risky dependencies.
```

## Good First Codex Tasks

1. Scaffold Expo TypeScript app using the stack in `docs/technical-plan.md`.
2. Add lint, format, typecheck, and test scripts.
3. Implement the pure Fibonacci progression engine with tests.
4. Add SQLite schema and repository layer.
5. Build the home screen and create habit flow.
6. Add daily logging and missed-day settlement.
7. Add stay mode.
8. Add reports.
9. Add reminders.
10. Polish Android testing states and internal build readiness.

## Operating Rules

- Keep tasks small enough to review.
- Treat the user as Product Manager and acceptance reviewer.
- Ask for approval before editing files or installing dependencies.
- Ask Codex to write or update tests for product logic.
- Ask Codex to run verification commands before summarizing.
- Do not let Codex commit, merge, or push until you have reviewed the diff and approved.
- Use the Codex app worktree mode for experiments or parallel tasks.
- Keep `README.md`, `docs/product-requirements.md`, and `docs/technical-plan.md` synchronized when product rules change.

## VS Code Habits

- Open the project root, not a parent folder.
- Use file mentions like `@docs/product-requirements.md` and `@src/lib/fibonacci/index.ts`.
- Select a code range and use `Add to Thread` when asking about a specific bug.
- Start with `medium` reasoning for normal work.
- Use `high` reasoning for architecture, debugging, data migration, and review.
- Use `low` reasoning for tiny edits after the patterns are established.
- Keep one thread per task or feature.
- Start a new thread when the task changes significantly.

## Merge Flow

1. Create a feature branch.
2. Ask Codex to implement one milestone slice.
3. Ask Codex to run tests, lint, and typecheck.
4. Review the diff yourself.
5. Ask Codex to address review comments.
6. Approve the commit.
7. Push and open a PR when you have a remote.
8. Ask Codex for PR review before merging.
