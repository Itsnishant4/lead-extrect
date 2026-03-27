# Conventions

## Patterns That Are Consistent
- Path aliases use `@/` rooted at `src`.
- Domain naming is consistent across actions, services, and repositories.
- Validation is centralized in `src/lib/validations.ts` with Zod.
- Most authenticated server actions start with `getSession()` and return `{ success, ... }` shaped responses.
- Most service classes expose static methods rather than instantiated objects.

## Coding Style
- TypeScript is used everywhere, but the strictness is uneven.
- There are many well-named files and sensible folder boundaries.
- Comments are generally practical and explain operational constraints when present.

## Type Quality
- Some areas are strongly typed through Drizzle and Zod.
- Several important seams still use `any`, especially in integration dispatching, some error handling, and repository transaction parameters.
- Return types are not always explicit, which makes service contracts softer than they need to be.

## Error Handling
- Server actions usually funnel failures through `handleActionError`.
- Services often throw plain `Error` objects with user-facing strings.
- There is some effort toward safer masking via `maskError`, but it is not yet universal.

## Data Access Conventions
- Reads and writes often happen in services directly through Drizzle.
- Repositories are used where ownership checks or more complex query reuse exists, but the project has not committed fully to repository-only access.
- Ownership validation is present in repository methods for tasks/searches, which is a positive pattern.

## Maintainability Signals
- The architecture is understandable for a single-team product codebase.
- Schema centralization helps discoverability but is becoming large enough that modularization may be warranted.
- A few implementation details reveal historical adaptation to infrastructure constraints, which can make behavior less obvious to new contributors.
