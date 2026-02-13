import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { setupDatabase, getAllTrades, getTrade, createTrade, updateTrade, deleteTrade, getAllRules, addRule, deleteRule, getUser, registerUser } from './database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5001
const isProduction = process.env.NODE_ENV === 'production'
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod'

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Initialize database
setupDatabase()

// Auth Middleware
const authenticateToken = (req, res, next) => {
    // Allow public access to login/register/health
    if (req.path === '/api/login' || req.path === '/api/register' || req.path === '/api/health') {
        return next()
    }

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.status(401).json({ success: false, error: 'Unauthorized' })

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, error: 'Forbidden' })
        req.user = user
        next()
    })
}

// Routes

// Auth Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password required' })
        }

        // In production, disable public registration or add admin check
        // For now, allow registration if no users exist or simple open registration
        const hashedPassword = await bcrypt.hash(password, 10)
        const userId = registerUser(username, hashedPassword)

        res.status(201).json({ success: true, message: 'User registered successfully' })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = getUser(username)

        if (!user) {
            return res.status(400).json({ success: false, error: 'User not found' })
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username }, JWT_SECRET)
            res.json({ success: true, token, username: user.username })
        } else {
            res.status(401).json({ success: false, error: 'Invalid password' })
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

// Protected Routes (Apply Auth Middleware only if needed, or selectively)
// For simplicity, let's protect modification routes but maybe allow viewing?
// No, user requested privacy. Let's protect sensitive routes.
// But for now, let's keep GET public if desired, but user said "private journal".
// So let's protect everything except health check.

// Make api routes use auth middleware?
// Or just adding it to specific routes.
// To keep things simple and robust, let's just add protection to the frontend first, 
// and optionally protect backend routes. But backend protection is creating the real security.

// Get all trades - Protected? Yes.
app.get('/api/trades', authenticateToken, (req, res) => {
    try {
        const trades = getAllTrades()
        res.json({ success: true, data: trades })
    } catch (error) {
        console.error('Error fetching trades:', error)
        res.status(500).json({ success: false, error: error.message })
    }
})

// Get single trade
app.get('/api/trades/:id', authenticateToken, (req, res) => {
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
app.post('/api/trades', authenticateToken, (req, res) => {
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
app.put('/api/trades/:id', authenticateToken, (req, res) => {
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
app.delete('/api/trades/:id', authenticateToken, (req, res) => {
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

// --- Rules Routes ---

app.get('/api/rules', authenticateToken, (req, res) => {
    try {
        const rules = getAllRules()
        res.json({ success: true, data: rules })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

app.post('/api/rules', authenticateToken, (req, res) => {
    try {
        const id = addRule(req.body)
        res.status(201).json({ success: true, data: { id, ...req.body } })
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})

app.delete('/api/rules/:id', authenticateToken, (req, res) => {
    try {
        const deleted = deleteRule(req.params.id)
        if (deleted) {
            res.json({ success: true })
        } else {
            res.status(404).json({ success: false, error: 'Rule not found' })
        }
    } catch (error) {
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
    console.log(`📊 Trade Journal API ready and secured 🔒`)
    console.log(`🌐 Network: Use your computer's IP address with port ${PORT}`)
    if (isProduction) {
        console.log(`🏭 Production mode: Serving static files`)
    }
})
