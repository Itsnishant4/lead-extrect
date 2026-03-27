# Testing

## Current Coverage Shape
- Vitest is configured for Node-based unit tests.
- The test suite currently appears focused on utility-level behavior:
  - JWT/auth-edge helpers
  - validation schemas
  - general utilities/promise helpers
- There is no visible end-to-end, browser, or integration-test layer in the inspected repo.

## What Is Covered Well
- Validation schema behavior has broad happy-path and failure-path checks.
- Auth token helper behavior is unit tested with mocked `jose`.
- Small utility functions have a basic safety net.

## What Is Missing
- Server actions are largely untested.
- Services with meaningful business logic are largely untested.
- Database-heavy flows such as task deletion, orphan lead cleanup, subscription checks, integration sync, and auth/OTP edge cases do not appear to have automated coverage.
- Middleware behavior is not covered by an obvious test layer.
- UI routes and major user journeys do not appear to have E2E coverage.

## Test Strategy Assessment
- The current suite is enough to protect helper functions, but not enough to confidently refactor core product workflows.
- The largest testing gap is around data lifecycle correctness, especially because the app contains many multi-table mutations.
- A realistic next step would be service-level tests against a disposable test database, followed by a few E2E tests for login, task creation, and lead management.
