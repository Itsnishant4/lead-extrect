import postgres from 'postgres';

// Handle Vercel's environment variables
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing POSTGRES_URL or DATABASE_URL environment variable');
}

// Disable SSL for local dev if needed, but Neon usually requires it.
// postgres.js handles 'sslmode=require' in the connection string automatically.
export const db = postgres(connectionString, {
  ssl: 'require',
  max: 10, // Max number of connections
  idle_timeout: 20, // Idle connection timeout in seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Avoid cached plan errors after schema changes
});

let isInitialized = false;

export async function seed() {
  if (isInitialized) return;

  try {
    console.log('Seeding database...');

    // 1. Create Users Table First (so others can reference it)
    await db`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        plan_type TEXT DEFAULT 'free',
        leads_extracted INTEGER DEFAULT 0,
        bonus_credits INTEGER DEFAULT 0,
        subscription_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Create Tasks Table
    await db`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        status TEXT DEFAULT 'pending', 
        total_keywords INTEGER DEFAULT 0,
        current_keyword_index INTEGER DEFAULT 0,
        total_leads INTEGER DEFAULT 0,
        keywords TEXT, 
        user_agent TEXT,
        accept_language TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add last_logs_sent_at to tasks
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_logs_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- Create server_logs table
      CREATE TABLE IF NOT EXISTS server_logs (
        id SERIAL PRIMARY KEY,
        task_id INTEGER,
        level TEXT DEFAULT 'INFO',
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Create Searches Table
    await db`
      CREATE TABLE IF NOT EXISTS searches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        query TEXT NOT NULL,
        task_id INTEGER REFERENCES tasks(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Create Leads Table
    await db`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        search_id INTEGER REFERENCES searches(id),
        task_id INTEGER REFERENCES tasks(id),
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        website TEXT,
        phone TEXT,
        email TEXT,
        rating REAL,
        reviews_count INTEGER,
        category TEXT,
        place_id TEXT UNIQUE,
        latitude REAL,
        longitude REAL,
        direction_url TEXT,
        monday_hours TEXT,
        tuesday_hours TEXT,
        wednesday_hours TEXT,
        thursday_hours TEXT,
        friday_hours TEXT,
        saturday_hours TEXT,
        sunday_hours TEXT,
        facebook TEXT,
        instagram TEXT,
        linkedin TEXT,
        twitter TEXT,
        youtube TEXT,
        pinterest TEXT,
        tiktok TEXT,
        website_email TEXT,
        website_phone TEXT,
        lead_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4b. Create Lead Sources Table (track duplicate sources)
    await db`
      CREATE TABLE IF NOT EXISTS lead_sources (
        lead_id INTEGER REFERENCES leads(id),
        search_id INTEGER REFERENCES searches(id),
        task_id INTEGER REFERENCES tasks(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (lead_id, search_id)
      );
    `;

    // 5. Create City Areas Table
    await db`
      CREATE TABLE IF NOT EXISTS city_areas (
        id SERIAL PRIMARY KEY,
        country TEXT NOT NULL,
        state TEXT NOT NULL,
        city TEXT NOT NULL,
        areas TEXT NOT NULL, 
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(country, state, city)
      );
    `;

    // 6. Create Keyword History Table
    await db`
      CREATE TABLE IF NOT EXISTS keyword_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        niche TEXT,
        location TEXT,
        keywords TEXT NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 7. Create Task Leads Junction Table
    await db`
      CREATE TABLE IF NOT EXISTS task_leads (
        task_id INTEGER REFERENCES tasks(id),
        lead_id INTEGER REFERENCES leads(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(task_id, lead_id)
      );
    `;

    // 8. Create Settings Table
    await db`
      CREATE TABLE IF NOT EXISTS settings (
        user_id INTEGER REFERENCES users(id),
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (user_id, key)
      );
    `;

    // 8b. Create Saved Lists Table
    await db`
      CREATE TABLE IF NOT EXISTS saved_lists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db`
      CREATE TABLE IF NOT EXISTS saved_list_items (
        list_id INTEGER REFERENCES saved_lists(id),
        lead_id INTEGER REFERENCES leads(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (list_id, lead_id)
      );
    `;

    // 8c. Create Export Templates Table
    await db`
      CREATE TABLE IF NOT EXISTS export_templates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        columns TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 9. Create Proxies Table
    await db`
      CREATE TABLE IF NOT EXISTS proxies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        username TEXT,
        password TEXT,
        protocol TEXT DEFAULT 'http',
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 10. Create Audit Logs Table
    await db`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action TEXT NOT NULL,
        status TEXT,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 11. Create Pincode Coordinates Cache Table
    await db`
      CREATE TABLE IF NOT EXISTS pincode_coords (
        country TEXT NOT NULL,
        pincode TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (country, pincode)
      );
    `;

    // --- MIGRATION LOGIC (For existing tables) ---
    // Safely add columns if they don't exist

    // Helper to check if column exists and add if missing
    const addColumnIfNotExists = async (table: string, column: string, columnType: string) => {
      try {
        const result = await db`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ${table} AND column_name = ${column}
        `;

        if (result.length === 0) {
          await db.unsafe(`ALTER TABLE ${table} ADD COLUMN ${column} ${columnType}`);
          console.log(`Added column ${column} to ${table}`);
        }
      } catch (e) {
        console.error(`Failed to add column ${column} to ${table}:`, e);
      }
    };

    await addColumnIfNotExists('tasks', 'user_id', 'INTEGER REFERENCES users(id)');
    await addColumnIfNotExists('searches', 'user_id', 'INTEGER REFERENCES users(id)');
    await addColumnIfNotExists('keyword_history', 'user_id', 'INTEGER REFERENCES users(id)');
    await addColumnIfNotExists('proxies', 'user_id', 'INTEGER REFERENCES users(id)');
    await addColumnIfNotExists('settings', 'user_id', 'INTEGER REFERENCES users(id)');
    await addColumnIfNotExists('users', 'is_admin', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists('users', 'plan_type', "TEXT DEFAULT 'free'");
    await addColumnIfNotExists('users', 'leads_extracted', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('users', 'bonus_credits', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('users', 'subscription_expiry', 'TIMESTAMP');
    await addColumnIfNotExists('users', 'is_suspended', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists('leads', 'lead_score', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('keyword_history', 'total_keywords', 'INTEGER');
    await addColumnIfNotExists('keyword_history', 'keywords_truncated', 'BOOLEAN DEFAULT FALSE');
    await addColumnIfNotExists('tasks', 'user_agent', 'TEXT');
    await addColumnIfNotExists('tasks', 'accept_language', 'TEXT');
    await addColumnIfNotExists('tasks', 'export_file_ids', 'TEXT');
    await addColumnIfNotExists('tasks', 'exported_leads_count', 'INTEGER DEFAULT 0');


    // Default settings (only insert if clean DB, or ignore conflicts)
    // This insert might fail if user_id is null in the new schema constraint, but here we just try.
    // We won't insert default settings here to avoid errors with the new schema.

    isInitialized = true;
    console.log('Database seeded/migrated successfully.');
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}
