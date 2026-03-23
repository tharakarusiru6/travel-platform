import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserAvatar from './UserAvatar'
import toast from 'react-hot-toast'
import './Navbar.css'

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">✦</span>
          <span>TravelNest</span>
        </Link>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <Link to="/create" className="btn btn-primary">+ New Experience</Link>

              {/* ✅ NEW — photo + name clickable → goes to own profile */}
              <Link to={`/profile/${user?._id}`} className="navbar-profile">
                <UserAvatar user={user} size="sm" linkable={false} />
                <span className="navbar-username">{user?.name?.split(' ')[0]}</span>
              </Link>

              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Log In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
