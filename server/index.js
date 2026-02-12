import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupDatabase, getAllTrades, getTrade, createTrade, updateTrade, deleteTrade } from './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5001
const isProduction = process.env.NODE_ENV === 'production'

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' })) // Increased limit for base64 images

// Initialize database
setupDatabase()

// Routes

// Get all trades
app.get('/api/trades', (req, res) => {
    try {
        const trades = getAllTrades()
        res.json({ success: true, data: trades })
    } catch (error) {
        console.error('Error fetching trades:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

// Get single trade
app.get('/api/trades/:id', (req, res) => {
    try {
        const trade = getTrade(req.params.id)
        if (!trade) {
            return res.status(404).json({ success: false, error: 'Trade not found' })
        }
        res.json({ success: true, data: trade })
    } catch (error) {
        console.error('Error fetching trade:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

// Create new trade
app.post('/api/trades', (req, res) => {
    try {
        const tradeData = req.body
        const id = createTrade(tradeData)
        const newTrade = getTrade(id)
        res.status(201).json({ success: true, data: newTrade })
    } catch (error) {
        console.error('Error creating trade:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

// Update trade
app.put('/api/trades/:id', (req, res) => {
    try {
        const updated = updateTrade(req.params.id, req.body)
        if (!updated) {
            return res.status(404).json({ success: false, error: 'Trade not found' })
        }
        const updatedTrade = getTrade(req.params.id)
        res.json({ success: true, data: updatedTrade })
    } catch (error) {
        console.error('Error updating trade:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

// Delete trade
app.delete('/api/trades/:id', (req, res) => {
    try {
        const deleted = deleteTrade(req.params.id)
        if (!deleted) {
            return res.status(404).json({ success: false, error: 'Trade not found' })
        }
        res.json({ success: true, message: 'Trade deleted successfully' })
    } catch (error) {
        console.error('Error deleting trade:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' })
})

// Serve static files in production
if (isProduction) {
    const distPath = path.join(__dirname, '../dist')
    app.use(express.static(distPath))

    // Catch-all route to serve index.html for client-side routing
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'))
    })
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📊 Trade Journal API ready`)
    console.log(`🌐 Network: Use your computer's IP address with port ${PORT}`)
    if (isProduction) {
        console.log(`🏭 Production mode: Serving static files`)
    }
})
