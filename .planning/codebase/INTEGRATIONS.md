# Integrations

## External Services Present In Code
- Google authentication through app routes under `src/app/api/auth/google`.
- OAuth initiation/callback flow for product integrations under `src/app/api/integrations/oauth`.
- Google Sheets sync support.
- HubSpot sync support.
- Generic webhook-style destinations for Zapier, Make, and custom webhooks.
- Slack webhook notifications.
- Autopay webhook endpoint under `src/app/api/webhook/autopay`.
- Email delivery through `nodemailer`.
- Web push notifications via `web-push`.

## Internal Integration Design
- `src/services/integration.service.ts` is the orchestration layer for listing, connecting, configuring, syncing, and logging integrations.
- `src/lib/integrations/dispatcher.ts` routes a sync request by integration slug to a specific handler.
- Token storage appears to live in `userIntegrations`, with optional encrypted values handled through `src/lib/integrations/encryption.ts`.
- Integration metadata is stored in database-backed `integrations` and `userIntegrations` tables rather than hardcoded only in the frontend.

## Data Flow
- User connects an integration.
- OAuth/config is stored against the user integration record.
- When a task completes or sync is triggered, leads are loaded and passed to `dispatchSync`.
- The dispatcher calls a provider-specific function or a generic webhook sender.
- Sync results are written back through integration log/stat update methods.

## Operational Dependencies
- Reliable outbound HTTP access is required for OAuth flows, Sheets/HubSpot sync, Slack, and generic webhooks.
- Token refresh handling exists in the provider modules, so long-running integrations depend on correct refresh token lifecycle management.
- Any worker or background automation that marks tasks complete is coupled to this integration pipeline if auto-sync is enabled.

## Gaps And Watchpoints
- The dispatcher uses `any[]` and generic config blobs, so contract drift between UI config and provider handlers is a maintainability risk.
- Webhook/slack handlers are straightforward and likely easy to extend, but they do not show strong retry/backoff handling from the inspected code.
- Security of stored access tokens depends on how consistently encryption helpers are applied across all write paths.
