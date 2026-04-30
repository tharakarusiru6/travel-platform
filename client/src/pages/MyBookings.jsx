import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../utils/api'
import toast from 'react-hot-toast'
import './Bookings.css'

const STATUS_STYLES = {
  pending:          { label: 'Pending',          color: '#F59E0B', bg: '#FFFBEB' },
  confirmed:        { label: 'Confirmed',         color: '#10B981', bg: '#ECFDF5' },
  cancelled:        { label: 'Cancelled',         color: '#6B7280', bg: '#F3F4F6' },
  refund_requested: { label: 'Refund Requested',  color: '#EF4444', bg: '#FEF2F2' },
  refunded:         { label: 'Refunded',          color: '#3B82F6', bg: '#EFF6FF' }
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/bookings/my')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (bookingId) => {
    try {
      const { data } = await api.put('/bookings/' + bookingId + '/cancel', { reason: 'Cancelled by traveler' })
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: data.status } : b))
      toast.success('Booking cancelled')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }} />

  return (
    <div className="bookings-page page-enter">
      <div className="container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>Track all your stay requests and reservations</p>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Find a stay and make your first booking!</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Stays</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => {
              const s = STATUS_STYLES[booking.status] || STATUS_STYLES.pending
              return (
                <div key={booking._id} className="booking-card">
                  <div className="booking-card__image-wrap">
                    <img src={booking.stay?.imageUrl} alt={booking.stay?.name}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=80' }}
                    />
                  </div>
                  <div className="booking-card__info">
                    <div className="booking-card__top">
                      <div>
                        <h3 className="booking-card__name">
                          <Link to={'/stays/' + booking.stay?._id}>{booking.stay?.name}</Link>
                        </h3>
                        <p className="booking-card__location">{booking.stay?.location}</p>
                      </div>
                      <span className="booking-status" style={{ color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                    </div>

                    <div className="booking-dates">
                      <div className="booking-date">
                        <span className="booking-date__label">Check-in</span>
                        <span className="booking-date__value">{format(new Date(booking.checkIn), 'dd MMM yyyy')}</span>
                      </div>
                      <div className="booking-date__arrow">to</div>
                      <div className="booking-date">
                        <span className="booking-date__label">Check-out</span>
                        <span className="booking-date__value">{format(new Date(booking.checkOut), 'dd MMM yyyy')}</span>
                      </div>
                    </div>

                    <div className="booking-card__footer">
                      <div className="booking-price">
                        <span>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                        <span className="booking-price__total">Total: ${booking.totalPrice}</span>
                      </div>
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancel(booking._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
