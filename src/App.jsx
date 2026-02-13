import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import TradeForm from './components/TradeForm'
import TradesList from './components/TradesList'
import TradeDetail from './components/TradeDetail'
import TradingRules from './components/TradingRules'
import Login from './components/Login'
import { TradesProvider } from './context/TradesContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'

function PrivateRoute({ children }) {
    const { user } = useAuth()
    return user ? children : <Navigate to="/login" />
}

function Navigation() {
    const location = useLocation()
    const { logout } = useAuth()

    const isActive = (path) => location.pathname === path

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-brand">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M7 14l4-4 3 3 5-5" stroke="#2962ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="7" cy="14" r="1.5" fill="#2962ff" />
                        <circle cx="11" cy="10" r="1.5" fill="#2962ff" />
                        <circle cx="14" cy="13" r="1.5" fill="#2962ff" />
                        <circle cx="19" cy="8" r="1.5" fill="#2962ff" />
                    </svg>
                    <h1>Trade Journal</h1>
                </div>
                <div className="nav-links">
                    <Link to="/rules" className={isActive('/rules') ? 'active' : ''}>Trading Rules</Link>
                    <Link to="/" className={isActive('/') ? 'active' : ''}>Dashboard</Link>
                    <Link to="/new-trade" className={isActive('/new-trade') ? 'active' : ''}>New Trade</Link>
                    <Link to="/trades" className={isActive('/trades') ? 'active' : ''}>All Trades</Link>
                    <button onClick={logout} className="btn-logout" title="Logout">🚪</button>
                </div>
            </div>
        </nav>
    )
}

function AppContent() {
    const { user } = useAuth()

    return (
        <div className="app">
            {user && <Navigation />}
            <main className="main-content">
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/rules" element={<PrivateRoute><TradingRules /></PrivateRoute>} />
                    <Route path="/new-trade" element={<PrivateRoute><TradeForm /></PrivateRoute>} />
                    <Route path="/edit-trade/:id" element={<PrivateRoute><TradeForm /></PrivateRoute>} />
                    <Route path="/trades" element={<PrivateRoute><TradesList /></PrivateRoute>} />
                    <Route path="/trade/:id" element={<PrivateRoute><TradeDetail /></PrivateRoute>} />
                </Routes>
            </main>
        </div>
    )
}

function App() {
    return (
        <AuthProvider>
            <TradesProvider>
                <Router>
                    <AppContent />
                </Router>
            </TradesProvider>
        </AuthProvider>
    )
}

export default App
