// lib/db.ts
import { Pool } from 'pg'

declare global {
  var pool: Pool | undefined
}

const pool = globalThis.pool || new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

if (process.env.NODE_ENV === 'development') {
  globalThis.pool = pool
}

export { pool }