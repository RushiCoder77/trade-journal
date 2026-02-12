import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const db = new Database(join(__dirname, 'trades.db'))

// Create trades table
export function setupDatabase() {
  const createTableSQL = `
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
    )
  `

  db.exec(createTableSQL)

  // Migration: Add marketStage column if it doesn't exist
  try {
    const tableInfo = db.prepare("PRAGMA table_info(trades)").all()
    const hasMarketStage = tableInfo.some(column => column.name === 'marketStage')

    if (!hasMarketStage) {
      console.log('⚙️  Adding marketStage column to existing database...')
      db.exec('ALTER TABLE trades ADD COLUMN marketStage TEXT')
      console.log('✅ Migration complete: marketStage column added')
    }
  } catch (error) {
    console.error('Migration error:', error)
  }

  console.log('✅ Database initialized')
}

// Get all trades
export function getAllTrades() {
  const stmt = db.prepare('SELECT * FROM trades ORDER BY date DESC')
  return stmt.all()
}

// Get single trade
export function getTrade(id) {
  const stmt = db.prepare('SELECT * FROM trades WHERE id = ?')
  return stmt.get(id)
}

// Create new trade
export function createTrade(trade) {
  const id = Date.now().toString()
  const createdAt = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO trades (
      id, stockName, date, patternType, setupQuality, marketStage,
      entryPrice, stopLoss, targetPrice, riskPercent,
      status, result, notes, chartImage, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
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

// Update trade
export function updateTrade(id, trade) {
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

  const info = stmt.run(
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

  return info.changes > 0
}

// Delete trade
export function deleteTrade(id) {
  const stmt = db.prepare('DELETE FROM trades WHERE id = ?')
  const info = stmt.run(id)
  return info.changes > 0
}

// Get trade statistics
export function getStats() {
  const trades = getAllTrades()
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

export default db
