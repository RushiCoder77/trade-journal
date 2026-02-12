import { useTradesContext } from '../context/TradesContext'
import { Link } from 'react-router-dom'
import './Dashboard.css'

function Dashboard() {
    const { trades, getStats, loading } = useTradesContext()
    const stats = getStats()

    const recentTrades = trades.slice(0, 5)

    if (loading) {
        return (
            <div className="dashboard">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard">
            <div className="page-header">
                <div className="page-title">
                    <h1>Dashboard</h1>
                </div>
                <Link to="/new-trade" className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    New Trade
                </Link>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon neutral">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Trades</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon success">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Winning Trades</div>
                        <div className="stat-value text-success">{stats.wins}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon danger">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Losing Trades</div>
                        <div className="stat-value text-danger">{stats.losses}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon primary">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Win Rate</div>
                        <div className="stat-value">{stats.winRate}%</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon warning">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Avg R:R</div>
                        <div className="stat-value">{stats.avgRR}</div>
                    </div>
                </div>
            </div>

            <div className="recent-trades-section">
                <div className="section-header">
                    <h2>Recent Trades</h2>
                    <Link to="/trades" className="btn btn-secondary">View All</Link>
                </div>

                {recentTrades.length === 0 ? (
                    <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <h3>No trades yet</h3>
                        <p>Start tracking your trades to see insights here</p>
                        <Link to="/new-trade" className="btn btn-primary">Add Your First Trade</Link>
                    </div>
                ) : (
                    <div className="trades-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Stock</th>
                                    <th>Pattern</th>
                                    <th>Quality</th>
                                    <th>Entry</th>
                                    <th>Status</th>
                                    <th>Result</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTrades.map(trade => (
                                    <tr key={trade.id} onClick={() => window.location.href = `/trade/${trade.id}`} style={{ cursor: 'pointer' }}>
                                        <td><strong>{trade.stockName}</strong></td>
                                        <td>{trade.patternType}</td>
                                        <td>
                                            <span className={`quality-badge quality-${trade.setupQuality.toLowerCase().replace('+', 'plus')}`}>
                                                {trade.setupQuality}
                                            </span>
                                        </td>
                                        <td>₹{parseFloat(trade.entryPrice).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge badge-${trade.status === 'Closed' ? 'neutral' :
                                                trade.status === 'Executed' ? 'warning' : 'neutral'
                                                }`}>
                                                {trade.status}
                                            </span>
                                        </td>
                                        <td>
                                            {trade.result && trade.result !== '-' ? (
                                                <span className={`badge badge-${trade.result === 'Win' ? 'success' :
                                                    trade.result === 'Loss' ? 'danger' : 'neutral'
                                                    }`}>
                                                    {trade.result}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="text-muted">{new Date(trade.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
