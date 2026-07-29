import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://meetflow:meetflow123@localhost:5432/meetflow?schema=public' });
const client = await pool.connect();
try {
  // Check raw timestamp values without timezone extraction
  const overrides = await client.query('SELECT id, date::text, date::timestamptz::text, date::timestamp::text FROM "DateOverride"');
  console.log('=== DATE OVERRIDES (raw) ===');
  console.log(JSON.stringify(overrides.rows, null, 2));
  
  const wa = await client.query('SELECT * FROM "WeeklyAvailability"');
  console.log('\n=== WEEKLY AVAILABILITY ===');
  console.log(JSON.stringify(wa.rows, null, 2));
  
  const intervals = await client.query('SELECT * FROM "AvailabilityInterval" ORDER BY "dayOfWeek", "startTime"');
  console.log('\n=== AVAILABILITY INTERVALS ===');
  console.log(JSON.stringify(intervals.rows, null, 2));
  
  // Check column types
  const colTypes = await client.query(`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'DateOverride'
  `);
  console.log('\n=== DATE OVERRIDE COLUMNS ===');
  console.log(JSON.stringify(colTypes.rows, null, 2));
} finally {
  client.release();
  await pool.end();
}
