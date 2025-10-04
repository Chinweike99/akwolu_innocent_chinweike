import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';
config();

async function run() {
  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
  const sql = fs.readFileSync(path.resolve('./migrations/schema.sql'), 'utf8');

  // create a connection that allows multiple statements
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT || 3306),
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });

  console.log('Connected to database ..........');

  try {
    console.log('Running migrations via mysql2...');
    await conn.query(sql);
    console.log('Migrations applied');
  } finally {
    await conn.end();
  }
}

run().catch(err => {
  console.error('Migrations failed', err);
  process.exit(1);
});
