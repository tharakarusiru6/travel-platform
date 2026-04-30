import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './AuthPages.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-split">

        {/* Left panel */}
        <div className="auth-panel auth-panel--left">
          <div className="auth-brand">
            <span className="auth-brand__icon">✦</span>
            <span className="auth-brand__name">TravelNest</span>
          </div>
          <h2 className="auth-panel__title">Welcome back, explorer</h2>
          <p className="auth-panel__sub">Sign in to continue discovering experiences and stays around the world.</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature__icon">✦</span>
              <span>Manage your bookings</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature__icon">✦</span>
              <span>Rate and review experiences</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature__icon">✦</span>
              <span>Connect with local providers</span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-panel auth-panel--right">
          <div className="auth-form-wrap">
            <h1>Sign In</h1>
            <p className="auth-form-sub">New to TravelNest? <Link to="/register">Create an account</Link></p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Your password" required />
              </div>
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
