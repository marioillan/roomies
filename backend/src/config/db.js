import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
  console.log('Conexión a la base de datos establecida');
});

pool.on('error', (err) => {
  console.error('Error en la conexión a la base de datos:', err);
});

export const prisma = new PrismaClient();

export default pool;
