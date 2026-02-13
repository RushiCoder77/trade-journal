import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (isLogin) {
            const result = await login(username, password)
            if (result.success) {
                navigate('/')
            } else {
                setError(result.error || 'Login failed')
            }
        } else {
            const result = await register(username, password)
            if (result.success) {
                // Auto login after register or ask to login
                setIsLogin(true)
                setError('Registration successful! Please login.')
                setUsername('')
                setPassword('')
            } else {
                setError(result.error || 'Registration failed')
            }
        }
        setLoading(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Trade Journal 🔒</h1>
                    <p className="auth-subtitle">{isLogin ? 'Welcome back, Trader' : 'Start your journey'}</p>
                </div>

                {error && <div className={`error-message ${error.includes('successful') ? 'success' : ''}`}>
                    {error}
                </div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-auth" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div className="auth-footer">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                        className="auth-link"
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError('')
                        }}
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login
