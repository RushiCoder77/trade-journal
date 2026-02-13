import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import TradeForm from './components/TradeForm'
import TradesList from './components/TradesList'
import TradeDetail from './components/TradeDetail'
import TradingRules from './components/TradingRules'
import { TradesProvider } from './context/TradesContext'
import './App.css'

function Navigation() {
    const location = useLocation()

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
                </div>
            </div>
        </nav>
    )
}

function App() {
    return (
        <TradesProvider>
            <Router>
                <div className="app">
                    <Navigation />
                    <main className="main-content">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/rules" element={<TradingRules />} />
                            <Route path="/new-trade" element={<TradeForm />} />
                            <Route path="/edit-trade/:id" element={<TradeForm />} />
                            <Route path="/trades" element={<TradesList />} />
                            <Route path="/trade/:id" element={<TradeDetail />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </TradesProvider>
    )
}

export default App
