import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTradesContext } from '../context/TradesContext'
import './TradeForm.css'

const PATTERN_TYPES = ['VCP', 'Cup & Handle', 'Breakout', 'Pullback', 'Flag', 'Other']
const SETUP_QUALITIES = ['A+', 'A', 'B', 'C']
const TRADE_STATUSES = ['Planned', 'Executed', 'Closed']
const RESULTS = ['-', 'Win', 'Loss', 'Breakeven']
const MARKET_STAGES = [
    'Stage 1 — Accumulation (Base Building)',
    'Stage 2 — Uptrend (Higher High)',
    'Stage 3 — Distribution (Topping Phase)',
    'Stage 4 — Downtrend (Capital Protection Phase)'
]

function TradeForm() {
    const navigate = useNavigate()
    const { id } = useParams()
    const { addTrade, updateTrade, getTrade } = useTradesContext()
    const isEditing = Boolean(id)

    const [formData, setFormData] = useState({
        stockName: '',
        date: new Date().toISOString().split('T')[0],
        patternType: 'VCP',
        setupQuality: 'A+',
        marketStage: 'Stage 2 — Uptrend (Higher High)',
        entryPrice: '',
        stopLoss: '',
        targetPrice: '',
        riskPercent: 0,
        status: 'Planned',
        result: '-',
        notes: '',
        chartImage: ''
    })

    const [imagePreview, setImagePreview] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (isEditing) {
            const trade = getTrade(id)
            if (trade) {
                setFormData(trade)
                if (trade.chartImage) {
                    setImagePreview(trade.chartImage)
                }
            } else {
                navigate('/trades')
            }
        }
    }, [id, isEditing, getTrade, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const newData = { ...prev, [name]: value }

            // Auto-calculate risk percentage when entry or stop loss changes
            if (name === 'entryPrice' || name === 'stopLoss') {
                const entry = parseFloat(name === 'entryPrice' ? value : prev.entryPrice)
                const stop = parseFloat(name === 'stopLoss' ? value : prev.stopLoss)

                if (entry && stop && entry > 0) {
                    const riskPercent = ((Math.abs(entry - stop) / entry) * 100).toFixed(2)
                    newData.riskPercent = parseFloat(riskPercent)
                }
            }

            return newData
        })
    }

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result
                setFormData(prev => ({ ...prev, chartImage: base64String }))
                setImagePreview(base64String)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setSaving(true)

            if (isEditing) {
                await updateTrade(id, formData)
            } else {
                await addTrade(formData)
            }

            navigate('/trades')
        } catch (error) {
            const errorMessage = error.message || 'Failed to save trade. Please try again.'
            alert(errorMessage)
            console.error('Save error:', error)
        } finally {
            setSaving(false)
        }
    }

    const calculateRR = () => {
        const entry = parseFloat(formData.entryPrice)
        const stop = parseFloat(formData.stopLoss)
        const target = parseFloat(formData.targetPrice)

        if (entry && stop && target && entry !== stop) {
            const risk = Math.abs(entry - stop)
            const reward = Math.abs(target - entry)
            return (reward / risk).toFixed(2)
        }
        return '-'
    }

    return (
        <div className="trade-form-page">
            <div className="page-header">
                <div className="page-title">
                    <button onClick={() => navigate(-1)} className="btn-back">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <h1>{isEditing ? 'Edit Trade' : 'New Trade'}</h1>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="trade-form">
                    <div className="form-grid">
                        {/* Stock Name */}
                        <div className="form-group full-width">
                            <label htmlFor="stockName">Stock Name *</label>
                            <input
                                type="text"
                                id="stockName"
                                name="stockName"
                                value={formData.stockName}
                                onChange={handleChange}
                                placeholder="e.g., RELIANCE, TCS, INFY"
                                required
                            />
                        </div>

                        {/* Date */}
                        <div className="form-group">
                            <label htmlFor="date">Date *</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Pattern Type */}
                        <div className="form-group">
                            <label htmlFor="patternType">Pattern Type *</label>
                            <select
                                id="patternType"
                                name="patternType"
                                value={formData.patternType}
                                onChange={handleChange}
                                required
                            >
                                {PATTERN_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Setup Quality */}
                        <div className="form-group">
                            <label htmlFor="setupQuality">Setup Quality *</label>
                            <select
                                id="setupQuality"
                                name="setupQuality"
                                value={formData.setupQuality}
                                onChange={handleChange}
                                required
                            >
                                {SETUP_QUALITIES.map(quality => (
                                    <option key={quality} value={quality}>{quality}</option>
                                ))}
                            </select>
                        </div>

                        {/* Stock Stage */}
                        <div className="form-group">
                            <label htmlFor="marketStage">Stock Stage *</label>
                            <select
                                id="marketStage"
                                name="marketStage"
                                value={formData.marketStage}
                                onChange={handleChange}
                                required
                            >
                                {MARKET_STAGES.map(stage => (
                                    <option key={stage} value={stage}>{stage}</option>
                                ))}
                            </select>
                        </div>

                        {/* Entry Price */}
                        <div className="form-group">
                            <label htmlFor="entryPrice">Entry Price *</label>
                            <input
                                type="number"
                                id="entryPrice"
                                name="entryPrice"
                                value={formData.entryPrice}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>

                        {/* Stop Loss */}
                        <div className="form-group">
                            <label htmlFor="stopLoss">Stop Loss *</label>
                            <input
                                type="number"
                                id="stopLoss"
                                name="stopLoss"
                                value={formData.stopLoss}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>

                        {/* Target Price */}
                        <div className="form-group">
                            <label htmlFor="targetPrice">Target Price *</label>
                            <input
                                type="number"
                                id="targetPrice"
                                name="targetPrice"
                                value={formData.targetPrice}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>

                        {/* Risk % - Auto-calculated */}
                        <div className="form-group">
                            <label>Risk % (Auto-calculated)</label>
                            <div className="rr-display">
                                <strong>{formData.riskPercent ? formData.riskPercent.toFixed(2) : '0.00'}%</strong>
                            </div>
                        </div>

                        {/* R:R Display */}
                        <div className="form-group">
                            <label>Risk:Reward Ratio</label>
                            <div className="rr-display">
                                <strong>1:{calculateRR()}</strong>
                            </div>
                        </div>

                        {/* Trade Status */}
                        <div className="form-group">
                            <label htmlFor="status">Trade Status *</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                {TRADE_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        {/* Result */}
                        <div className="form-group">
                            <label htmlFor="result">Result</label>
                            <select
                                id="result"
                                name="result"
                                value={formData.result}
                                onChange={handleChange}
                            >
                                {RESULTS.map(result => (
                                    <option key={result} value={result}>{result}</option>
                                ))}
                            </select>
                        </div>

                        {/* Notes */}
                        <div className="form-group full-width">
                            <label htmlFor="notes">Notes</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Add any additional notes about this trade setup..."
                                rows="4"
                            />
                        </div>

                        {/* Chart Image Upload */}
                        <div className="form-group full-width">
                            <label htmlFor="chartImage">Chart Screenshot</label>
                            <div className="image-upload-container">
                                <input
                                    type="file"
                                    id="chartImage"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="chartImage" className="upload-label">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                    <span>{imagePreview ? 'Change Image' : 'Upload Chart'}</span>
                                </label>
                                {imagePreview && (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Chart preview" />
                                        <button
                                            type="button"
                                            className="remove-image"
                                            onClick={() => {
                                                setImagePreview(null)
                                                setFormData(prev => ({ ...prev, chartImage: '' }))
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (isEditing ? 'Update Trade' : 'Save Trade')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default TradeForm
