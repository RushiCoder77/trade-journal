const API_BASE_URL = '/api'

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        })

        // Check if response is JSON
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server is not responding correctly. Make sure backend is running on port 5000.')
        }

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || `Server error: ${response.status}`)
        }

        return data
    } catch (error) {
        console.error('API Error Details:', {
            endpoint: `${API_BASE_URL}${endpoint}`,
            error: error.message,
            type: error.name
        })

        // Provide more helpful error messages
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            throw new Error('Cannot connect to server. Please make sure the backend is running (npm run dev)')
        }

        throw error
    }
}

// Get all trades
export async function fetchAllTrades() {
    try {
        const response = await apiCall('/trades')
        return response.data
    } catch (error) {
        console.error('Error fetching trades:', error)
        throw error
    }
}

// Get single trade
export async function fetchTrade(id) {
    try {
        const response = await apiCall(`/trades/${id}`)
        return response.data
    } catch (error) {
        console.error('Error fetching trade:', error)
        throw error
    }
}

// Create trade
export async function createTrade(tradeData) {
    try {
        console.log('Creating trade:', tradeData)
        const response = await apiCall('/trades', {
            method: 'POST',
            body: JSON.stringify(tradeData),
        })
        console.log('Trade created successfully:', response.data)
        return response.data
    } catch (error) {
        console.error('Error creating trade:', error)
        throw error
    }
}

// Update trade
export async function updateTrade(id, tradeData) {
    try {
        console.log('Updating trade:', id, tradeData)
        const response = await apiCall(`/trades/${id}`, {
            method: 'PUT',
            body: JSON.stringify(tradeData),
        })
        console.log('Trade updated successfully:', response.data)
        return response.data
    } catch (error) {
        console.error('Error updating trade:', error)
        throw error
    }
}

// Delete trade
export async function deleteTrade(id) {
    try {
        const response = await apiCall(`/trades/${id}`, {
            method: 'DELETE',
        })
        return response
    } catch (error) {
        console.error('Error deleting trade:', error)
        throw error
    }
}

// Health check
export async function checkServerHealth() {
    try {
        const response = await apiCall('/health')
        return response.success
    } catch (error) {
        console.error('Server health check failed:', error)
        return false
    }
}

// --- Rules API ---

export async function fetchRules() {
    const response = await apiCall('/rules')
    return response.data
}

export async function addRule(ruleData) {
    const response = await apiCall('/rules', {
        method: 'POST',
        body: JSON.stringify(ruleData)
    })
    return response.data
}

export async function deleteRule(id) {
    return await apiCall(`/rules/${id}`, {
        method: 'DELETE'
    })
}
