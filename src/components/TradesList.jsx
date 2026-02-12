import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTradesContext } from '../context/TradesContext'
import './TradesList.css'

function TradesList() {
    const { trades, deleteTrade } = useTradesContext()
    const navigate = useNavigate()

    const [filters, setFilters] = useState({
        patternType: '',
        result: '',
        startDate: '',
        endDate: ''
    })

    const [sortConfig, setSortConfig] = useState({
        key: 'date',
        direction: 'desc'
    })

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({ ...prev, [name]: value }))
    }

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const filteredAndSortedTrades = useMemo(() => {
        let filtered = [...trades]

        // Apply filters
        if (filters.patternType) {
            filtered = filtered.filter(t => t.patternType === filters.patternType)
        }
        if (filters.result && filters.result !== '-') {
            filtered = filtered.filter(t => t.result === filters.result)
        }
        if (filters.startDate) {
            filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate))
        }
        if (filters.endDate) {
            filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate))
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[sortConfig.key]
            let bVal = b[sortConfig.key]

            if (sortConfig.key === 'date') {
                aVal = new Date(aVal)
                bVal = new Date(bVal)
            } else if (sortConfig.key === 'entryPrice' || sortConfig.key === 'stopLoss' || sortConfig.key === 'targetPrice') {
                aVal = parseFloat(aVal)
                bVal = parseFloat(bVal)
            }

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [trades, filters, sortConfig])

    const handleDelete = async (id, stockName) => {
        if (window.confirm(`Are you sure you want to delete the trade for ${stockName}?`)) {
            try {
                await deleteTrade(id)
            } catch (error) {
                alert('Failed to delete trade. Please try again.')
            }
        }
    }

    const clearFilters = () => {
        setFilters({
            patternType: '',
            result: '',
            startDate: '',
            endDate: ''
        })
    }

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" opacity="0.3">
                    <path d="M7 3v8M4 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )
        }
        return sortConfig.direction === 'asc' ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 11V3M4 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 3v8M4 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    return (
        <div className="trades-list-page">
            <div className="page-header">
                <div className="page-title">
                    <h1>All Trades</h1>
                    <span className="trade-count">{filteredAndSortedTrades.length} trades</span>
                </div>
                <Link to="/new-trade" className="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    New Trade
                </Link>
            </div>

            <div className="filters-section">
                <div className="filters-grid">
                    <div className="filter-group">
                        <label htmlFor="patternType">Pattern Type</label>
                        <select
                            id="patternType"
                            name="patternType"
                            value={filters.patternType}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Patterns</option>
                            <option value="VCP">VCP</option>
                            <option value="Cup & Handle">Cup & Handle</option>
                            <option value="Breakout">Breakout</option>
                            <option value="Pullback">Pullback</option>
                            <option value="Flag">Flag</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="result">Result</label>
                        <select
                            id="result"
                            name="result"
                            value={filters.result}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Results</option>
                            <option value="Win">Win</option>
                            <option value="Loss">Loss</option>
                            <option value="Breakeven">Breakeven</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label htmlFor="startDate">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="endDate">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>

                {(filters.patternType || filters.result || filters.startDate || filters.endDate) && (
                    <button onClick={clearFilters} className="btn btn-secondary clear-filters">
                        Clear Filters
                    </button>
                )}
            </div>

            {filteredAndSortedTrades.length === 0 ? (
                <div className="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <h3>No trades found</h3>
                    <p>
                        {trades.length === 0
                            ? 'Start by adding your first trade'
                            : 'Try adjusting your filters'}
                    </p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('stockName')} className="sortable">
                                    <div className="th-content">
                                        Stock
                                        <SortIcon columnKey="stockName" />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('patternType')} className="sortable">
                                    <div className="th-content">
                                        Pattern
                                        <SortIcon columnKey="patternType" />
                                    </div>
                                </th>
                                <th>Quality</th>
                                <th onClick={() => handleSort('entryPrice')} className="sortable">
                                    <div className="th-content">
                                        Entry
                                        <SortIcon columnKey="entryPrice" />
                                    </div>
                                </th>
                                <th>SL</th>
                                <th>Target</th>
                                <th>Status</th>
                                <th onClick={() => handleSort('result')} className="sortable">
                                    <div className="th-content">
                                        Result
                                        <SortIcon columnKey="result" />
                                    </div>
                                </th>
                                <th onClick={() => handleSort('date')} className="sortable">
                                    <div className="th-content">
                                        Date
                                        <SortIcon columnKey="date" />
                                    </div>
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedTrades.map(trade => (
                                <tr key={trade.id}>
                                    <td>
                                        <Link to={`/trade/${trade.id}`} className="stock-link">
                                            <strong>{trade.stockName}</strong>
                                        </Link>
                                    </td>
                                    <td>{trade.patternType}</td>
                                    <td>
                                        <span className={`quality-badge quality-${trade.setupQuality.toLowerCase().replace('+', 'plus')}`}>
                                            {trade.setupQuality}
                                        </span>
                                    </td>
                                    <td>₹{parseFloat(trade.entryPrice).toFixed(2)}</td>
                                    <td className="text-danger">₹{parseFloat(trade.stopLoss).toFixed(2)}</td>
                                    <td className="text-success">₹{parseFloat(trade.targetPrice).toFixed(2)}</td>
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
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => navigate(`/edit-trade/${trade.id}`)}
                                                className="btn-icon"
                                                title="Edit"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M11.333 2A1.886 1.886 0 0114 4.667l-9 9-3.667.333.334-3.666 9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(trade.id, trade.stockName)}
                                                className="btn-icon btn-icon-danger"
                                                title="Delete"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default TradesList
