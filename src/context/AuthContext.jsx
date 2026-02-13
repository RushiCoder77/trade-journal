import { createContext, useState, useContext, useEffect } from 'react'
import { loginUser, registerUser } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for saved token on load
        const token = localStorage.getItem('token')
        const username = localStorage.getItem('username')
        if (token && username) {
            setUser({ username, token })
        }
        setLoading(false)
    }, [])

    const login = async (username, password) => {
        try {
            const data = await loginUser({ username, password })
            if (data.success) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('username', data.username)
                setUser({ username: data.username, token: data.token })
                return { success: true }
            }
            return { success: false, error: data.error }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const register = async (username, password) => {
        try {
            const data = await registerUser({ username, password })
            return data
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
