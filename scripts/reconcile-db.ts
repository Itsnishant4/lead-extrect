import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url) {
  console.error('DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const db = createClient({
  url,
  authToken,
});

async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.execute({
    sql: `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    args: [tableName],
  });

  return result.rows.length > 0;
}

async function columnExists(tableName: string, columnName: string): Promise<boolean> {
  const result = await db.execute(`PRAGMA table_info(${tableName})`);
  return result.rows.some((row: any) => row.name === columnName);
}

async function ensure(sql: string, label: string) {
  await db.execute(sql);
  console.log(`OK: ${label}`);
}

async function reconcile() {
  console.log(`Reconciling database schema for ${url}...`);

  if (!(await columnExists('leads', 'email_verified'))) {
    await ensure(
      `ALTER TABLE leads ADD COLUMN email_verified INTEGER DEFAULT false`,
      'added leads.email_verified'
    );
  } else {
    console.log('OK: leads.email_verified already exists');
  }

  if (!(await tableExists('integrations'))) {
    await ensure(
      `CREATE TABLE integrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        slug TEXT NOT NULL,
        name TEXT NOT NULL,
        feature_flag TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        icon_url TEXT,
        is_active INTEGER DEFAULT true,
        oauth_provider TEXT,
        config_schema TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )`,
      'created integrations table'
    );
  } else {
    console.log('OK: integrations table already exists');
  }

  if (!(await tableExists('user_integrations'))) {
    await ensure(
      `CREATE TABLE user_integrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id INTEGER NOT NULL,
        integration_id INTEGER NOT NULL,
        is_enabled INTEGER DEFAULT true,
        access_token TEXT,
        refresh_token TEXT,
        token_expiry INTEGER,
        api_key TEXT,
        config TEXT,
        last_synced_at INTEGER,
        total_synced INTEGER DEFAULT 0,
        last_error TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action,
        FOREIGN KEY (integration_id) REFERENCES integrations(id) ON UPDATE no action ON DELETE no action
      )`,
      'created user_integrations table'
    );
  } else {
    console.log('OK: user_integrations table already exists');
  }

  if (!(await tableExists('integration_logs'))) {
    await ensure(
      `CREATE TABLE integration_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id INTEGER NOT NULL,
        integration_id INTEGER NOT NULL,
        task_id INTEGER,
        action TEXT NOT NULL,
        status TEXT NOT NULL,
        leads_count INTEGER DEFAULT 0,
        error_message TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action,
        FOREIGN KEY (integration_id) REFERENCES integrations(id) ON UPDATE no action ON DELETE no action,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON UPDATE no action ON DELETE no action
      )`,
      'created integration_logs table'
    );
  } else {
    console.log('OK: integration_logs table already exists');
  }

  if (!(await tableExists('user_api_keys'))) {
    await ensure(
      `CREATE TABLE user_api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        key_hash TEXT NOT NULL,
        key_prefix TEXT NOT NULL,
        permissions TEXT,
        last_used_at INTEGER,
        expires_at INTEGER,
        is_active INTEGER DEFAULT true,
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE no action ON DELETE no action
      )`,
      'created user_api_keys table'
    );
  } else {
    console.log('OK: user_api_keys table already exists');
  }

  const indexes = [
    ['CREATE UNIQUE INDEX IF NOT EXISTS integrations_slug_unique ON integrations (slug)', 'integrations_slug_unique'],
    ['CREATE INDEX IF NOT EXISTS idx_integrations_slug ON integrations (slug)', 'idx_integrations_slug'],
    ['CREATE INDEX IF NOT EXISTS idx_integrations_category ON integrations (category)', 'idx_integrations_category'],
    ['CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations (user_id)', 'idx_user_integrations_user_id'],
    ['CREATE INDEX IF NOT EXISTS idx_user_integrations_integration_id ON user_integrations (integration_id)', 'idx_user_integrations_integration_id'],
    ['CREATE UNIQUE INDEX IF NOT EXISTS user_integrations_user_integration_unique ON user_integrations (user_id, integration_id)', 'user_integrations_user_integration_unique'],
    ['CREATE INDEX IF NOT EXISTS idx_integration_logs_user_id ON integration_logs (user_id)', 'idx_integration_logs_user_id'],
    ['CREATE INDEX IF NOT EXISTS idx_integration_logs_integration_id ON integration_logs (integration_id)', 'idx_integration_logs_integration_id'],
    ['CREATE INDEX IF NOT EXISTS idx_integration_logs_created_at ON integration_logs (created_at)', 'idx_integration_logs_created_at'],
    ['CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys (user_id)', 'idx_user_api_keys_user_id'],
    ['CREATE UNIQUE INDEX IF NOT EXISTS user_api_keys_key_hash_unique ON user_api_keys (key_hash)', 'user_api_keys_key_hash_unique'],
    ['CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (user_id, is_read)', 'idx_notifications_is_read'],
    ['CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id)', 'idx_transactions_user_id'],
    ['CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status)', 'idx_transactions_status'],
    ['CREATE INDEX IF NOT EXISTS idx_transactions_gateway_order_id ON transactions (gateway_order_id)', 'idx_transactions_gateway_order_id'],
    ['CREATE INDEX IF NOT EXISTS idx_searches_user_created ON searches (user_id, created_at)', 'idx_searches_user_created'],
  ] as const;

  for (const [sql, label] of indexes) {
    await ensure(sql, `ensured index ${label}`);
  }

  console.log('Schema reconciliation complete.');
}

reconcile().catch((error) => {
  console.error('Failed to reconcile schema:', error);
  process.exit(1);
});
