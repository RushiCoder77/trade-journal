import { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../services/api'

const TradesContext = createContext()

export const useTradesContext = () => {
    const context = useContext(TradesContext)
    if (!context) {
        throw new Error('useTradesContext must be used within TradesProvider')
    }
    return context
}

export const TradesProvider = ({ children }) => {
    const [trades, setTrades] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Load trades from database on mount
    useEffect(() => {
        loadTrades()
    }, [])

    const loadTrades = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await api.fetchAllTrades()
            setTrades(data)
        } catch (err) {
            console.error('Error loading trades:', err)
            setError('Failed to load trades')
        } finally {
            setLoading(false)
        }
    }

    const addTrade = async (trade) => {
        try {
            const newTrade = await api.createTrade(trade)
            setTrades(prev => [newTrade, ...prev])
            return newTrade.id
        } catch (err) {
            console.error('Error adding trade:', err)
            throw err
        }
    }

    const updateTrade = async (id, updatedTrade) => {
        try {
            const updated = await api.updateTrade(id, updatedTrade)
            setTrades(prev => prev.map(trade =>
                trade.id === id ? updated : trade
            ))
        } catch (err) {
            console.error('Error updating trade:', err)
            throw err
        }
    }

    const deleteTrade = async (id) => {
        try {
            await api.deleteTrade(id)
            setTrades(prev => prev.filter(trade => trade.id !== id))
        } catch (err) {
            console.error('Error deleting trade:', err)
            throw err
        }
    }

    const getTrade = (id) => {
        return trades.find(trade => trade.id === id)
    }

    const getStats = () => {
        const total = trades.length
        const executed = trades.filter(t => t.status === 'Closed')
        const wins = executed.filter(t => t.result === 'Win').length
        const losses = executed.filter(t => t.result === 'Loss').length
        const winRate = executed.length > 0 ? (wins / executed.length * 100).toFixed(1) : 0

        // Calculate average R:R
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

        return {
            total,
            wins,
            losses,
            winRate,
            avgRR
        }
    }

    const value = {
        trades,
        loading,
        error,
        addTrade,
        updateTrade,
        deleteTrade,
        getTrade,
        getStats,
        refreshTrades: loadTrades
    }

    return (
        <TradesContext.Provider value={value}>
            {children}
        </TradesContext.Provider>
    )
}
