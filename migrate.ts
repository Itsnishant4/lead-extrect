import { db, seed } from './src/lib/db/index';

async function migrate() {
  console.log('Running manual migration...');
  await seed();
  console.log('Migration complete.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
