# Stack

## Core Platform
- Next.js 16 App Router application with React 19 and TypeScript.
- Styling is primarily Tailwind CSS v4 with a sizeable custom component layer under `src/components/ui`.
- Client-side data fetching uses TanStack React Query.
- Server mutations are implemented mostly through Next.js server actions in `src/app/actions`.

## Data Layer
- Drizzle ORM is used for schema definition and queries.
- Database access is configured through `@libsql/client`, which suggests Turso/LibSQL compatibility, with a local SQLite fallback (`file:local.db`).
- Migrations live under `drizzle/`.
- The schema is broad and product-oriented, covering users, tasks, leads, searches, plans, subscriptions, integrations, notifications, proxies, blog content, audit logs, and related junction tables.

## Authentication And Session Model
- Password hashing uses `bcryptjs`.
- Sessions are JWT-based via `jose`, stored in an HTTP-only `session` cookie.
- `middleware.ts` verifies the JWT and sometimes re-checks the user in the database, with a short in-memory validation cache.
- Google auth exists through app routes and server actions, but the project appears to use custom auth plumbing rather than NextAuth/Auth.js.

## Runtime Characteristics
- The codebase mixes server actions, route handlers, React client pages, and middleware.
- Some code is explicitly written around LibSQL proxy limitations, for example avoiding transactions in OTP flows.
- In-memory maps are used for rate limiting and middleware user-validation caching, which means behavior is process-local rather than globally consistent across instances.

## Tooling
- Linting: ESLint 9 with Next config.
- Testing: Vitest with a Node environment.
- Scripts include database generation/migration and reconciliation helpers.
- There is no meaningful project README yet; repository knowledge currently lives in the code.

## Notable Libraries
- `zod` for request/input validation.
- `date-fns`, `recharts`, `lucide-react`, and motion/UI animation packages for the frontend.
- `nodemailer` and `web-push` for outbound messaging.
- `xlsx`, `jspdf`, and `jspdf-autotable` for export/report features.
- Proxy-related dependencies (`https-proxy-agent`, `socks-proxy-agent`) indicate scraper/worker network control requirements.

## Deployment Assumptions
- This looks designed for Vercel-style Next.js deployment, but some behavior assumes long-lived Node memory, which may not hold consistently in serverless environments.
- Secrets such as `JWT_SECRET`, database URL/auth token, mail settings, and OAuth credentials are expected through environment variables.
