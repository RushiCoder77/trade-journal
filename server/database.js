import Database from 'better-sqlite3'
import pg from 'pg'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// --- DB Adapter Setup ---
const isPostgres = !!process.env.DATABASE_URL
let db
let query

if (isPostgres) {
  // PostgreSQL (Production)
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Railway
  })

  // Helper to convert SQLite '?' syntax to Postgres '$1, $2'
  const convertSql = (sql) => {
    let i = 1
    return sql.replace(/\?/g, () => `$${i++}`)
  }

  query = async (sql, params = []) => {
    const text = convertSql(sql)
    const res = await pool.query(text, params)
    return res
  }

  // Wrapper to match better-sqlite3 API style for compatibility
  db = {
    prepare: (sql) => ({
      all: async (...params) => (await query(sql, params)).rows,
      get: async (...params) => (await query(sql, params)).rows[0],
      run: async (...params) => {
        const res = await query(sql, params)
        // Simulate SQLite 'lastInsertRowid' changes
        return { changes: res.rowCount, lastInsertRowid: res.rows[0]?.id }
      }
    }),
    exec: async (sql) => await pool.query(sql)
  }
} else {
  // SQLite (Local Development)
  const sqlite = new Database(join(__dirname, 'trades.db'))
  query = (sql, params) => sqlite.prepare(sql).all(params)

  db = {
    prepare: (sql) => sqlite.prepare(sql),
    exec: (sql) => sqlite.exec(sql)
  }
}

// --- Schema Setup ---
export async function setupDatabase() {
  console.log(`🔌 Using database: ${isPostgres ? 'PostgreSQL (Cloud)' : 'SQLite (Local)'}`)

  // Postgres: Use TEXT for IDs, TIMESTAMP, JSONB etc.
  // SQLite compatibility: Use generic types where possible
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `

  const rulesTable = `
    CREATE TABLE IF NOT EXISTS trading_rules (
      id TEXT PRIMARY KEY,
      ruleText TEXT NOT NULL,
      image TEXT,
      createdAt TEXT NOT NULL
    );
  `

  const tradesTable = `
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      stockName TEXT NOT NULL,
      date TEXT NOT NULL,
      patternType TEXT NOT NULL,
      setupQuality TEXT NOT NULL,
      marketStage TEXT,
      entryPrice REAL NOT NULL,
      stopLoss REAL NOT NULL,
      targetPrice REAL NOT NULL,
      riskPercent REAL NOT NULL,
      status TEXT NOT NULL,
      result TEXT,
      notes TEXT,
      chartImage TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    );
  `

  try {
    if (isPostgres) {
      await db.exec(usersTable)
      await db.exec(rulesTable)
      await db.exec(tradesTable)
      // Postgres Automatic Columns Checks (Migrations)
      // Check marketStage
      try {
        await db.exec('ALTER TABLE trades ADD COLUMN IF NOT EXISTS marketStage TEXT;')
      } catch (e) { /* ignore if exists */ }
      try {
        await db.exec('ALTER TABLE trading_rules ADD COLUMN IF NOT EXISTS image TEXT;')
      } catch (e) { /* ignore */ }
    } else {
      // SQLite
      db.exec(usersTable)
      db.exec(rulesTable)
      db.exec(tradesTable)

      // SQLite Migrations
      try {
        const tableInfo = db.prepare("PRAGMA table_info(trades)").all()
        if (!tableInfo.some(c => c.name === 'marketStage')) {
          db.exec('ALTER TABLE trades ADD COLUMN marketStage TEXT')
        }
      } catch (e) { }

      try {
        const tableInfo = db.prepare("PRAGMA table_info(trading_rules)").all()
        if (!tableInfo.some(c => c.name === 'image')) {
          db.exec('ALTER TABLE trading_rules ADD COLUMN image TEXT')
        }
      } catch (e) { }
    }
    console.log('✅ Database tables initialized')
  } catch (err) {
    console.error('❌ Database setup failed:', err)
  }
}

// --- API Functions (Async Wrapper) ---

// Helper for sync/async compatibility
const runQuery = async (stmt, ...params) => {
  if (isPostgres) {
    return await stmt.run(...params)
  }
  return stmt.run(...params)
}

const getQuery = async (stmt, ...params) => {
  if (isPostgres) {
    return await stmt.get(...params)
  }
  return stmt.get(...params)
}

const allQuery = async (stmt, ...params) => {
  if (isPostgres) {
    return await stmt.all(...params)
  }
  return stmt.all(...params)
}


// --- User Functions ---
export async function getUser(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
  return await getQuery(stmt, username)
}

export async function registerUser(username, hashedPassword) {
  const id = Date.now().toString()
  const createdAt = new Date().toISOString()

  // Postgres specific: returning ID for verification if needed
  const sql = isPostgres
    ? 'INSERT INTO users (id, username, password, createdAt) VALUES (?, ?, ?, ?) RETURNING id'
    : 'INSERT INTO users (id, username, password, createdAt) VALUES (?, ?, ?, ?)'

  const stmt = db.prepare(sql)
  try {
    await runQuery(stmt, id, username, hashedPassword, createdAt)
    return id
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === '23505') { // 23505 is Postgres unique violation
      throw new Error('Username already exists')
    }
    throw error
  }
}

// --- Trades Functions ---
export async function getAllTrades() {
  const stmt = db.prepare('SELECT * FROM trades ORDER BY date DESC')
  return await allQuery(stmt)
}

export async function getTrade(id) {
  const stmt = db.prepare('SELECT * FROM trades WHERE id = ?')
  return await getQuery(stmt, id)
}

export async function createTrade(trade) {
  const id = Date.now().toString()
  const createdAt = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO trades (
      id, stockName, date, patternType, setupQuality, marketStage,
      entryPrice, stopLoss, targetPrice, riskPercent,
      status, result, notes, chartImage, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  await runQuery(stmt,
    id,
    trade.stockName,
    trade.date,
    trade.patternType,
    trade.setupQuality,
    trade.marketStage || '',
    trade.entryPrice,
    trade.stopLoss,
    trade.targetPrice,
    trade.riskPercent,
    trade.status,
    trade.result || '-',
    trade.notes || '',
    trade.chartImage || '',
    createdAt
  )

  return id
}

export async function updateTrade(id, trade) {
  const updatedAt = new Date().toISOString()

  const stmt = db.prepare(`
    UPDATE trades SET
      stockName = ?,
      date = ?,
      patternType = ?,
      setupQuality = ?,
      marketStage = ?,
      entryPrice = ?,
      stopLoss = ?,
      targetPrice = ?,
      riskPercent = ?,
      status = ?,
      result = ?,
      notes = ?,
      chartImage = ?,
      updatedAt = ?
    WHERE id = ?
  `)

  const info = await runQuery(stmt,
    trade.stockName,
    trade.date,
    trade.patternType,
    trade.setupQuality,
    trade.marketStage || '',
    trade.entryPrice,
    trade.stopLoss,
    trade.targetPrice,
    trade.riskPercent,
    trade.status,
    trade.result || '-',
    trade.notes || '',
    trade.chartImage || '',
    updatedAt,
    id
  )

  return info.changes > 0 || (isPostgres && info.changes.rowCount > 0)
}

export async function deleteTrade(id) {
  const stmt = db.prepare('DELETE FROM trades WHERE id = ?')
  const info = await runQuery(stmt, id)
  return info.changes > 0 || (isPostgres && info.changes.rowCount > 0)
}

export async function getStats() {
  const trades = await getAllTrades()
  const total = trades.length
  const executed = trades.filter(t => t.status === 'Closed')
  const wins = executed.filter(t => t.result === 'Win').length
  const losses = executed.filter(t => t.result === 'Loss').length
  const winRate = executed.length > 0 ? (wins / executed.length * 100).toFixed(1) : 0

  let totalRR = 0
  let rrCount = 0

  trades.forEach(trade => {
    const entry = parseFloat(trade.entryPrice)
    const stop = parseFloat(trade.stopLoss)
    const target = parseFloat(trade.targetPrice)

    if (entry && stop && target && entry !== stop) {
      const risk = Math.abs(entry - stop)
      const reward = Math.abs(target - entry)
      if (risk > 0) {
        totalRR += reward / risk
        rrCount++
      }
    }
  })

  const avgRR = rrCount > 0 ? (totalRR / rrCount).toFixed(2) : 0

  return { total, wins, losses, winRate, avgRR }
}

// --- Trading Rules Functions ---

// Get all rules
export async function getAllRules() {
  const stmt = db.prepare('SELECT * FROM trading_rules ORDER BY createdAt DESC')
  return await allQuery(stmt)
}

// Add new rule
export async function addRule(ruleData) {
  const id = Date.now().toString()
  const createdAt = new Date().toISOString()

  // Use ruleText consistently
  const ruleText = ruleData.ruleText || ruleData.rule || ''
  const image = ruleData.image || null

  const stmt = db.prepare('INSERT INTO trading_rules (id, ruleText, image, createdAt) VALUES (?, ?, ?, ?)')
  await runQuery(stmt, id, ruleText, image, createdAt)

  return id
}

// Delete rule
export async function deleteRule(id) {
  const stmt = db.prepare('DELETE FROM trading_rules WHERE id = ?')
  const info = await runQuery(stmt, id)
  return info.changes > 0 || (isPostgres && info.changes.rowCount > 0)
}

export default db
