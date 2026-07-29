import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://meetflow:meetflow123@localhost:5432/meetflow?schema=public' });
const client = await pool.connect();
try {
  const eventTypeId = 'cms6fhysx0001u0i0ahwibthl';

  // 1. Get event type + user
  const et = await client.query('SELECT * FROM "EventType" WHERE id = $1', [eventTypeId]);
  const eventType = et.rows[0];
  console.log('=== EVENT TYPE ===');
  console.log('isActive:', eventType.isActive);
  console.log('userId:', eventType.userId);

  // 2. Simulate Monday Aug 3
  const mondayDate = '2026-08-03';
  // dayOfWeek for Monday is 1
  const dayOfWeek = 1;

  // 3. Query weekly availability
  const wa = await client.query('SELECT * FROM "WeeklyAvailability" WHERE "userId" = $1', [eventType.userId]);
  console.log('\n=== WEEKLY AVAILABILITY ===');
  console.log('Found:', wa.rows.length > 0);
  if (wa.rows[0]) {
    const intervals = await client.query(
      'SELECT * FROM "AvailabilityInterval" WHERE "weeklyAvailabilityId" = $1 AND "dayOfWeek" = $2 AND "isEnabled" = true',
      [wa.rows[0].id, dayOfWeek]
    );
    console.log('Matching intervals:', intervals.rows.length);
    console.log(JSON.stringify(intervals.rows));
  }

  // 4. Simulate date override query for Aug 4 (Tuesday)
  const overrideDate = new Date(Date.UTC(2026, 7, 4, 0, 0, 0, 0));
  // Convert to string that matches PostgreSQL timestamp format
  const overrideDateStr = overrideDate.toISOString().replace('T', ' ').replace('Z', '+00');
  
  // Try different date formats
  console.log('\n=== DATE OVERRIDE QUERY for Aug 4 ===');
  const ov1 = await client.query(
    'SELECT * FROM "DateOverride" WHERE "userId" = $1 AND "date" = $2',
    [eventType.userId, '2026-08-04 00:00:00']
  );
  console.log('Format 1 (2026-08-04 00:00:00):', ov1.rows.length > 0);
  
  const ov2 = await client.query(
    'SELECT * FROM "DateOverride" WHERE "userId" = $1 AND "date" = $2::timestamp',
    [eventType.userId, '2026-08-04 00:00:00']
  );
  console.log('Format 2 (cast):', ov2.rows.length > 0);
  
  const ov3 = await client.query(
    'SELECT * FROM "DateOverride" WHERE "userId" = $1',
    [eventType.userId]
  );
  console.log('All overrides:', ov3.rows.length);
  console.log(JSON.stringify(ov3.rows));

  // 5. Try finding the override using the actual DB value
  console.log('\n=== RAW OVERRIDE CHECK ===');
  const rawOv = await client.query('SELECT id, date::text, date::timestamp::text, EXTRACT(HOUR FROM date) as hour FROM "DateOverride"');
  console.log(JSON.stringify(rawOv.rows));
  
  // 6. Simulate what getAvailableSlots does for the Prisma query
  // Prisma sends the Date as a parameter - let's see what pg returns
  const prismaStyleDate = new Date(Date.UTC(2026, 7, 4, 0, 0, 0, 0));
  console.log('\nPrisma-style Date:', prismaStyleDate);
  console.log('Prisma-style Date ISO:', prismaStyleDate.toISOString());
  
  const ov4 = await client.query(
    'SELECT * FROM "DateOverride" WHERE "userId" = $1 AND "date" = $2',
    [eventType.userId, prismaStyleDate]
  );
  console.log('Query with Date object:', ov4.rows.length > 0, JSON.stringify(ov4.rows));
  
  // 7. Check the weekday mapping
  console.log('\n=== WEEKDAY CHECK ===');
  const dates = ['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07'];
  for (const d of dates) {
    const dt = new Date(Date.UTC(...d.split('-').map((n, i) => i === 1 ? Number(n) - 1 : Number(n)), 0, 0, 0, 0));
    console.log(`${d} -> dayOfWeek=${dt.getUTCDay()}`);
  }
} finally {
  client.release();
  await pool.end();
}
