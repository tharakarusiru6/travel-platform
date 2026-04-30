import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import api from '../utils/api'
import UserAvatar from '../components/UserAvatar'
import toast from 'react-hot-toast'
import './Bookings.css'

const STATUS_STYLES = {
  pending:          { label: 'Pending',          color: '#F59E0B', bg: '#FFFBEB' },
  confirmed:        { label: 'Confirmed',         color: '#10B981', bg: '#ECFDF5' },
  cancelled:        { label: 'Cancelled',         color: '#6B7280', bg: '#F3F4F6' },
  refund_requested: { label: 'Refund Requested',  color: '#EF4444', bg: '#FEF2F2' },
  refunded:         { label: 'Refunded',          color: '#3B82F6', bg: '#EFF6FF' }
}

export default function ManageBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/bookings/manage')
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleConfirm = async (bookingId) => {
    try {
      const { data } = await api.put('/bookings/' + bookingId + '/confirm')
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: data.status } : b))
      toast.success('Booking confirmed!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm')
    }
  }

  const handleRefund = async (bookingId) => {
    try {
      const { data } = await api.put('/bookings/' + bookingId + '/refund')
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: data.status } : b))
      toast.success('Refund processed!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund')
    }
  }

  const handleCancel = async (bookingId) => {
    try {
      const { data } = await api.put('/bookings/' + bookingId + '/cancel', { reason: 'Rejected by owner' })
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: data.status } : b))
      toast.success('Booking rejected')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject')
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }} />

  return (
    <div className="bookings-page page-enter">
      <div className="container">
        <div className="bookings-header">
          <h1>Manage Bookings</h1>
          <p>Review and manage booking requests for your properties</p>
        </div>

        <div className="bookings-filter-tabs">
          {['all', 'pending', 'confirmed', 'refund_requested', 'cancelled'].map(f => (
            <button
              key={f}
              className={'filter-tab' + (filter === f ? ' filter-tab--active' : '')}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : STATUS_STYLES[f]?.label}
              <span className="filter-tab__count">
                {f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings found</h3>
            <p>No bookings match this filter.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(booking => {
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
                        <div className="booking-traveler">
                          <UserAvatar user={booking.traveler} size="sm" linkable={true} />
                          <span>{booking.traveler?.name}</span>
                          <span className="traveler-email">{booking.traveler?.email}</span>
                        </div>
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

                    {booking.message && (
                      <div className="booking-message">
                        <span>Message: </span>{booking.message}
                      </div>
                    )}

                    <div className="booking-card__footer">
                      <div className="booking-price">
                        <span>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                        <span className="booking-price__total">Total: ${booking.totalPrice}</span>
                      </div>
                      <div className="booking-actions">
                        {booking.status === 'pending' && (
                          <>
                            <button className="btn btn-primary" onClick={() => handleConfirm(booking._id)}>Confirm</button>
                            <button className="btn btn-danger" onClick={() => handleCancel(booking._id)}>Reject</button>
                          </>
                        )}
                        {booking.status === 'refund_requested' && (
                          <button className="btn btn-ocean" onClick={() => handleRefund(booking._id)}>Mark Refunded</button>
                        )}
                      </div>
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
