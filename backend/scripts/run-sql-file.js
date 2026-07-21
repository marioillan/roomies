// Ejecuta un fichero .sql contra la base de datos apuntada por DATABASE_URL.
// Uso: node scripts/run-sql-file.js ../seed.sql
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const rutaArg = process.argv[2];
if (!rutaArg) {
  console.error('Uso: node scripts/run-sql-file.js <ruta-al-fichero.sql>');
  process.exit(1);
}

const rutaSql = resolve(process.cwd(), rutaArg);
const sql = readFileSync(rutaSql, 'utf-8');

const requiereSSL = /render\.com/.test(process.env.DATABASE_URL ?? '');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: requiereSSL ? { rejectUnauthorized: false } : undefined,
});

try {
  const { host, database } = pool.options;
  console.log(`Conectando a ${host}/${database}...`);
  console.log(`Ejecutando ${rutaSql}...`);
  await pool.query(sql);
  console.log('OK — fichero ejecutado sin errores.');
} catch (err) {
  console.error('ERROR ejecutando el SQL:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
