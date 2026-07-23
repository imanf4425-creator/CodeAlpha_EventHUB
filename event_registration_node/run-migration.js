require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'event_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
  try {
    console.log('🔄 Running database migration...');
    
    const sqlFile = path.join(__dirname, 'src/db/004_event_approval.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Changes applied:');
    console.log('  - Added approval_status column to tbl_events');
    console.log('  - Added approved_by column to tbl_events');
    console.log('  - Added approved_at column to tbl_events');
    console.log('  - Added rejection_reason column to tbl_events');
    console.log('  - Created index on approval_status');
    console.log('  - Set existing events to approved status');
    console.log('');
    console.log('🎉 Database is ready!');
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err);
  } finally {
    await pool.end();
  }
}

runMigration();
