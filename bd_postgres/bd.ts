// bd.ts
import { Pool } from "pg";

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'project',
  password: 'admin',
  port: 5432,
});
