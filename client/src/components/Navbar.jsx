import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import UserAvatar from './UserAvatar'
import toast from 'react-hot-toast'
import './Navbar.css'

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()
  const isHotelOwner = user?.role === 'hotel_owner'

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
              {isHotelOwner ? (
                <>
                  <Link to="/create-stay" className="btn btn-primary">+ List Property</Link>
                  <Link to="/manage-bookings" className="btn btn-ocean">Manage Bookings</Link>
                </>
              ) : (
                <>
                  <Link to="/create" className="btn btn-primary">+ New Experience</Link>
                  <Link to="/my-bookings" className="btn btn-ocean">My Bookings</Link>
                </>
              )}

              <Link to={'/profile/' + user?._id} className="navbar-profile">
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
