/**
 * Apply loan_module_v2.sql using DATABASE_URL.
 * Usage: DATABASE_URL=postgres://... node database_migrations/run-loan-module-v2.js
 *
 * Requires: npm install pg --save-dev (or pnpm add -D pg)
 */

const fs = require("fs")
const path = require("path")

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error("Set DATABASE_URL to your PostgreSQL connection string.")
    process.exit(1)
  }

  let pg
  try {
    pg = require("pg")
  } catch {
    console.error('Missing dependency "pg". Run: npm install pg --save-dev')
    process.exit(1)
  }

  const sqlPath = path.join(__dirname, "loan_module_v2.sql")
  const sql = fs.readFileSync(sqlPath, "utf8")

  const client = new pg.Client({ connectionString: url })
  await client.connect()
  try {
    await client.query(sql)
    console.log("OK: loan_module_v2.sql applied.")
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
