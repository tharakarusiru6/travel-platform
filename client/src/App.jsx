import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateListing from './pages/CreateListing'
import EditListing from './pages/EditListing'
import ListingDetail from './pages/ListingDetail'
import UserProfile from './pages/UserProfile'
import CreateStay from './pages/CreateStay'
import EditStay from './pages/EditStay'
import StayDetail from './pages/StayDetail'
import MyBookings from './pages/MyBookings'
import ManageBookings from './pages/ManageBookings'

function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }} />
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function HotelOwnerRoute({ children }) {
  const { isLoggedIn, loading, user } = useAuth()
  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }} />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (user?.role !== 'hotel_owner') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/stays/:id" element={<StayDetail />} />
        <Route path="/profile/:userId" element={<UserProfile />} />

        {/* Traveler routes */}
        <Route path="/create" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
        <Route path="/edit/:id" element={<PrivateRoute><EditListing /></PrivateRoute>} />
        <Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />

        {/* Hotel owner routes */}
        <Route path="/create-stay" element={<HotelOwnerRoute><CreateStay /></HotelOwnerRoute>} />
        <Route path="/edit-stay/:id" element={<HotelOwnerRoute><EditStay /></HotelOwnerRoute>} />
        <Route path="/manage-bookings" element={<HotelOwnerRoute><ManageBookings /></HotelOwnerRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
