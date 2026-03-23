import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateListing from './pages/CreateListing'
import EditListing from './pages/EditListing'
import ListingDetail from './pages/ListingDetail'
import UserProfile from './pages/UserProfile'   // ✅ NEW

function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }} />
  return isLoggedIn ? children : <Navigate to="/login" replace />
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
        <Route path="/profile/:userId" element={<UserProfile />} />  {/* ✅ NEW */}
        <Route path="/create" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
        <Route path="/edit/:id" element={<PrivateRoute><EditListing /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
