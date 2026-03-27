import { createHash, randomBytes } from 'crypto';

export const WEBHOOK_SYNC_KEY_HASH_SETTING = 'webhookSyncKeyHash';
export const WEBHOOK_SYNC_KEY_LAST4_SETTING = 'webhookSyncKeyLast4';
export const WEBHOOK_SYNC_KEY_CREATED_AT_SETTING = 'webhookSyncKeyCreatedAt';

export function generateWebhookSyncKey(): string {
  return `lswk_${randomBytes(24).toString('hex')}`;
}

export function hashWebhookSyncKey(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function getWebhookSyncKeyLast4(value: string): string {
  return value.slice(-4);
}
