import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './AuthPages.css'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'traveler' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.token, data.user)
      toast.success(`Welcome to TravelNest, ${data.user.name.split(' ')[0]}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
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
          <h2 className="auth-panel__title">Start your journey today</h2>
          <p className="auth-panel__sub">Join thousands of travelers discovering unique experiences and stays around the world.</p>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature__icon">✦</span>
              <span>Discover local experiences</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature__icon">✦</span>
              <span>Find and book unique stays</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature__icon">✦</span>
              <span>Connect with experience providers</span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="auth-panel auth-panel--right">
          <div className="auth-form-wrap">
            <h1>Create Account</h1>
            <p className="auth-form-sub">Already have an account? <Link to="/login">Sign in</Link></p>

            {/* Role selector */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${form.role === 'traveler' ? 'role-btn--active' : ''}`}
                onClick={() => setForm(f => ({ ...f, role: 'traveler' }))}
              >
                <span className="role-btn__icon">✦</span>
                <span className="role-btn__label">Traveler</span>
                <span className="role-btn__desc">Browse and book experiences and stays</span>
              </button>
              <button
                type="button"
                className={`role-btn ${form.role === 'hotel_owner' ? 'role-btn--active' : ''}`}
                onClick={() => setForm(f => ({ ...f, role: 'hotel_owner' }))}
              >
                <span className="role-btn__icon">✦</span>
                <span className="role-btn__label">Hotel Owner</span>
                <span className="role-btn__desc">List your property and manage bookings</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required minLength={2} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required minLength={6} />
              </div>
              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
