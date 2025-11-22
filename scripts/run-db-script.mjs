import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const sqlPath = path.join(__dirname, 'fix-db.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  console.log('Running SQL script...')
  
  // Split statements by semicolon to run them individually if needed, 
  // but postgres protocol usually handles multiple statements.
  // However, Supabase JS client doesn't support running raw SQL directly easily without RPC 
  // or using the postgres connection string.
  // Since I have POSTGRES_URL, I should use 'pg' library or 'postgres' library if available.
  // But I don't know if 'pg' is installed. 
  // Standard v0 environment usually has basic node modules.
  // Let's try using the Supabase client via a workaround or assume 'pg' is available?
  // Actually, the best way in v0 is often to use a "postgres" library if available.
  
  // Alternative: Use the "postgres" connection string with `fetch` to the SQL API? No.
  
  // Let's try to use the `pg` module. If it fails, I'll know.
  // If `pg` is not available, I might need to ask the user to run it or use a different method.
  
  // Wait, I can use `npm install pg` in the script? No.
  
  // Let's try using the `pg` library. It's a common dependency.
  try {
    const { Client } = await import('pg')
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false }
    })
    
    await client.connect()
    await client.query(sql)
    await client.end()
    console.log('Successfully ran SQL script.')
  } catch (e) {
    console.error('Error running SQL:', e)
  }
}

run()
