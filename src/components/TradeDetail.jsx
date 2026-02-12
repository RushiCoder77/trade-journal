import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTradesContext } from '../context/TradesContext'
import './TradeDetail.css'

function TradeDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { getTrade, deleteTrade } = useTradesContext()

    const trade = getTrade(id)

    if (!trade) {
        return (
            <div className="trade-detail-page">
                <div className="empty-state">
                    <h3>Trade not found</h3>
                    <Link to="/trades" className="btn btn-primary">Back to Trades</Link>
                </div>
            </div>
        )
    }

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete the trade for ${trade.stockName}?`)) {
            try {
                await deleteTrade(id)
                navigate('/trades')
            } catch (error) {
                alert('Failed to delete trade. Please try again.')
            }
        }
    }

    const calculateRR = () => {
        const entry = parseFloat(trade.entryPrice)
        const stop = parseFloat(trade.stopLoss)
        const target = parseFloat(trade.targetPrice)

        if (entry && stop && target && entry !== stop) {
            const risk = Math.abs(entry - stop)
            const reward = Math.abs(target - entry)
            return (reward / risk).toFixed(2)
        }
        return '-'
    }

    const calculateRiskAmount = () => {
        const entry = parseFloat(trade.entryPrice)
        const stop = parseFloat(trade.stopLoss)
        return Math.abs(entry - stop).toFixed(2)
    }

    const calculateRewardAmount = () => {
        const entry = parseFloat(trade.entryPrice)
        const target = parseFloat(trade.targetPrice)
        return Math.abs(target - entry).toFixed(2)
    }

    return (
        <div className="trade-detail-page">
            <div className="page-header">
                <div className="page-title">
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div>
                        <h1>{trade.stockName}</h1>
                        <p className="text-muted">{new Date(trade.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <Link to={`/edit-trade/${id}`} className="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.333 2A1.886 1.886 0 0114 4.667l-9 9-3.667.333.334-3.666 9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Edit
                    </Link>
                    <button onClick={handleDelete} className="btn btn-danger">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Delete
                    </button>
                </div>
            </div>

            <div className="detail-grid">
                {/* Trade Setup Info */}
                <div className="detail-card">
                    <h2>Trade Setup</h2>
                    <div className="detail-items">
                        <div className="detail-item">
                            <span className="detail-label">Pattern Type</span>
                            <span className="detail-value">{trade.patternType}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Setup Quality</span>
                            <span className={`quality-badge quality-${trade.setupQuality.toLowerCase().replace('+', 'plus')}`}>
                                {trade.setupQuality}
                            </span>
                        </div>
                        {trade.marketStage && (
                            <div className="detail-item">
                                <span className="detail-label">Stock Stage</span>
                                <span className="detail-value market-stage">{trade.marketStage}</span>
                            </div>
                        )}
                        <div className="detail-item">
                            <span className="detail-label">Trade Status</span>
                            <span className={`badge badge-${trade.status === 'Closed' ? 'neutral' :
                                trade.status === 'Executed' ? 'warning' : 'neutral'
                                }`}>
                                {trade.status}
                            </span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Result</span>
                            {trade.result && trade.result !== '-' ? (
                                <span className={`badge badge-${trade.result === 'Win' ? 'success' :
                                    trade.result === 'Loss' ? 'danger' : 'neutral'
                                    }`}>
                                    {trade.result}
                                </span>
                            ) : (
                                <span className="detail-value text-muted">-</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Price Levels */}
                <div className="detail-card">
                    <h2>Price Levels</h2>
                    <div className="detail-items">
                        <div className="detail-item">
                            <span className="detail-label">Entry Price</span>
                            <span className="detail-value price">₹{parseFloat(trade.entryPrice).toFixed(2)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Stop Loss</span>
                            <span className="detail-value price text-danger">₹{parseFloat(trade.stopLoss).toFixed(2)}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Target Price</span>
                            <span className="detail-value price text-success">₹{parseFloat(trade.targetPrice).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Risk Management */}
                <div className="detail-card">
                    <h2>Risk Management</h2>
                    <div className="detail-items">
                        <div className="detail-item">
                            <span className="detail-label">Risk %</span>
                            <span className="detail-value">{trade.riskPercent}%</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Risk Amount</span>
                            <span className="detail-value text-danger">₹{calculateRiskAmount()}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Reward Amount</span>
                            <span className="detail-value text-success">₹{calculateRewardAmount()}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Risk:Reward</span>
                            <span className="detail-value rr-ratio">1:{calculateRR()}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {trade.notes && (
                    <div className="detail-card full-width">
                        <h2>Notes</h2>
                        <div className="notes-content">
                            {trade.notes}
                        </div>
                    </div>
                )}

                {/* Chart Image */}
                {trade.chartImage && (
                    <div className="detail-card full-width">
                        <h2>Chart Screenshot</h2>
                        <div className="chart-image-container">
                            <img src={trade.chartImage} alt={`${trade.stockName} chart`} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TradeDetail
