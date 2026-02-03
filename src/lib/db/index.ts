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
});

export async function seed() {
  try {
    console.log('Seeding database...');
    
    await db`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'pending', 
        total_keywords INTEGER DEFAULT 0,
        current_keyword_index INTEGER DEFAULT 0,
        total_leads INTEGER DEFAULT 0,
        keywords TEXT, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db`
      CREATE TABLE IF NOT EXISTS searches (
        id SERIAL PRIMARY KEY,
        query TEXT NOT NULL,
        task_id INTEGER REFERENCES tasks(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

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

    await db`
      CREATE TABLE IF NOT EXISTS keyword_history (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        niche TEXT,
        location TEXT,
        keywords TEXT NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await db`
      CREATE TABLE IF NOT EXISTS task_leads (
        task_id INTEGER REFERENCES tasks(id),
        lead_id INTEGER REFERENCES leads(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(task_id, lead_id)
      );
    `;

    await db`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `;

    await db`
      CREATE TABLE IF NOT EXISTS proxies (
        id SERIAL PRIMARY KEY,
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        username TEXT,
        password TEXT,
        protocol TEXT DEFAULT 'http',
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Insert default settings safely
    await db`
      INSERT INTO settings (key, value) 
      VALUES ('exportCityWise', 'false') 
      ON CONFLICT (key) DO NOTHING
    `;
    
    console.log('Database seeded successfully via Postgres.js');
  } catch (error) {
    console.error('Failed to seed database:', error);
    // Don't throw for existing tables to avoid crash loops, but log accurately
  }
}
