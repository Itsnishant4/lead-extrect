# Concerns

## 1. Process-Local Security Controls
- `middleware.ts` and `src/lib/security/memory-ratelimit.ts` rely on in-memory maps for session validation caching and rate limiting.
- This works only per process and can become inconsistent across multiple instances, restarts, or serverless cold starts.
- Risk: uneven enforcement for login/signup/OTP protections and surprising auth behavior under scale.

## 2. Data-Lifecycle Complexity Around Leads And Tasks
- The product has many relationships among tasks, searches, leads, task leads, lead sources, lists, logs, settings, and templates.
- Deletion flows like `LeadService.wipeLeadsForUser` and `TaskService.deleteTask` are careful but complex and only lightly tested from what is visible.
- Risk: orphaned rows, accidental over-deletion, or regressions during schema evolution.

## 3. Incomplete Testing Around Core Business Logic
- Existing tests mostly cover helpers and validation.
- High-value flows such as auth service behavior, middleware, integration sync, subscription transitions, and task orchestration do not appear to have strong automated coverage.
- Risk: regressions are likely to surface in production rather than CI.

## 4. Mixed Architectural Discipline
- The service layer is useful, but some logic lives in actions, some in services, some in repositories, and some directly in middleware/route handlers.
- Risk: the codebase remains understandable now, but ongoing growth will make feature tracing and safe refactoring harder.

## 5. Large Monolithic Schema And Domain Surface
- `src/lib/db/schema.ts` is a single large schema module spanning many product areas.
- Risk: merge friction, discoverability issues, and accidental cross-domain coupling as more features are added.

## 6. Runtime Assumptions Versus Deployment Model
- Several parts of the app assume long-lived process memory, but the broader stack resembles a deployment target where instances may be ephemeral.
- Risk: operational behavior may differ significantly between local development and production.

## 7. README And Project Onboarding Are Weak
- The repository README is still the default Next.js template.
- Risk: new contributors must reverse-engineer setup, architecture, and operational expectations from the source.
