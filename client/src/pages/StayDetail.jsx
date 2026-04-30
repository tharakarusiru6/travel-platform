import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import StarRating from '../components/StarRating'
import RatingInput from '../components/RatingInput'
import UserAvatar from '../components/UserAvatar'
import './StayDetail.css'

export default function StayDetail() {
  const { id } = useParams()
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [stay, setStay] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState({ average: 0, total: 0 })
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  // Booking form state
  const [bookingForm, setBookingForm] = useState({ checkIn: '', checkOut: '', message: '' })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [nights, setNights] = useState(0)

  useEffect(() => {
    api.get('/stays/' + id)
      .then(({ data }) => setStay(data))
      .catch(() => { toast.error('Stay not found'); navigate('/') })
      .finally(() => setLoading(false))
  }, [id])

  // Calculate nights when dates change
  useEffect(() => {
    if (bookingForm.checkIn && bookingForm.checkOut) {
      const diff = new Date(bookingForm.checkOut) - new Date(bookingForm.checkIn)
      const n = Math.ceil(diff / (1000 * 60 * 60 * 24))
      setNights(n > 0 ? n : 0)
    } else {
      setNights(0)
    }
  }, [bookingForm.checkIn, bookingForm.checkOut])

  const isOwner = user && stay?.owner?._id === user._id
  const isTraveler = user && user.role === 'traveler'

  const handleLike = async () => {
    if (!isLoggedIn) { toast.error('Please log in to like stays'); return }
    setLikeLoading(true)
    try {
      const { data } = await api.post('/stays/' + id + '/like')
      setStay(s => ({
        ...s,
        likes: data.liked
          ? [...(s.likes || []), user._id]
          : (s.likes || []).filter(uid => uid !== user._id)
      }))
    } catch { toast.error('Failed to update like') }
    finally { setLikeLoading(false) }
  }

  const handleDelete = async () => {
    try {
      await api.delete('/stays/' + id)
      toast.success('Stay deleted')
      navigate('/')
    } catch { toast.error('Failed to delete stay') }
  }

  const handleBooking = async e => {
    e.preventDefault()
    if (!isLoggedIn) { navigate('/login'); return }
    if (nights <= 0) { toast.error('Please select valid dates'); return }
    setBookingLoading(true)
    try {
      await api.post('/bookings', {
        stayId: id,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        message: bookingForm.message
      })
      toast.success('Booking request sent!')
      navigate('/my-bookings')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }} />
  if (!stay) return null

  const isLiked = isLoggedIn && stay.likes?.includes(user._id)
  const likeCount = stay.likes?.length || 0
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="stay-detail-page page-enter">
      <div className="container">
        <Link to="/" className="back-btn">Back to Feed</Link>

        <div className="stay-detail-layout">
          <div className="stay-detail-left">
            <div className="stay-detail-image-wrap">
              <img src={stay.imageUrl} alt={stay.name}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80' }}
              />
              {rating.total > 0 && (
                <div className="image-rating-badge">
                  <StarRating average={rating.average} total={rating.total} size="sm" />
                </div>
              )}
            </div>

            <div className="stay-detail-content">
              <div className="stay-detail-location">Location: {stay.location}</div>
              <h1 className="stay-detail-name">{stay.name}</h1>

              <div className="stay-detail-rating">
                <StarRating average={rating.average} total={rating.total} size="lg" />
              </div>

              <div className="stay-detail-meta">
                <Link to={'/profile/' + stay.owner?._id} className="stay-detail-owner">
                  <UserAvatar user={stay.owner} size="md" linkable={false} />
                  <div>
                    <div className="owner-name">{stay.owner?.name}</div>
                    <div className="owner-time">Listed {formatDistanceToNow(new Date(stay.createdAt), { addSuffix: true })}</div>
                  </div>
                </Link>
                <div className="stay-detail-price">
                  <span className="price-amount">${stay.pricePerNight}</span>
                  <span className="price-label">per night</span>
                </div>
              </div>

              <div className="stay-detail-desc">
                <h3>About this property</h3>
                <p>{stay.description}</p>
              </div>

              {stay.amenities?.length > 0 && (
                <div className="stay-amenities">
                  <h3>Amenities</h3>
                  <div className="amenities-grid">
                    {stay.amenities.map(a => (
                      <div key={a} className="amenity-item">{a}</div>
                    ))}
                  </div>
                </div>
              )}

              <RatingInput
                listingId={id}
                onRatingUpdate={(data) => setRating({ average: data.average, total: data.total })}
                apiPath={'stays'}
              />

              <div className="stay-detail-actions">
                <button className={'btn like-btn' + (isLiked ? ' liked' : '')} onClick={handleLike} disabled={likeLoading}>
                  {isLiked ? 'Liked' : 'Like'} {likeCount > 0 ? likeCount : ''}
                </button>
                {isOwner && (
                  <>
                    <Link to={'/edit-stay/' + id} className="btn btn-ocean">Edit</Link>
                    {!deleteConfirm ? (
                      <button className="btn btn-danger" onClick={() => setDeleteConfirm(true)}>Delete</button>
                    ) : (
                      <div className="delete-confirm">
                        <span>Are you sure?</span>
                        <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
                        <button className="btn btn-secondary" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Booking Panel */}
          {isTraveler && !isOwner && (
            <div className="booking-panel">
              <h3 className="booking-panel__title">Book This Stay</h3>
              <div className="booking-panel__price">${stay.pricePerNight} <span>/ night</span></div>

              <form onSubmit={handleBooking} className="booking-form">
                <div className="form-group">
                  <label>Check-in Date</label>
                  <input type="date" value={bookingForm.checkIn} min={today}
                    onChange={e => setBookingForm(f => ({ ...f, checkIn: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Check-out Date</label>
                  <input type="date" value={bookingForm.checkOut}
                    min={bookingForm.checkIn || today}
                    onChange={e => setBookingForm(f => ({ ...f, checkOut: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Message to Host (optional)</label>
                  <textarea value={bookingForm.message}
                    onChange={e => setBookingForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell the host about your stay..." maxLength={300} style={{ minHeight: '80px' }} />
                </div>

                {nights > 0 && (
                  <div className="booking-summary">
                    <div className="booking-summary__row">
                      <span>${stay.pricePerNight} x {nights} night{nights > 1 ? 's' : ''}</span>
                      <span>${stay.pricePerNight * nights}</span>
                    </div>
                    <div className="booking-summary__total">
                      <span>Total</span>
                      <span>${stay.pricePerNight * nights}</span>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary booking-submit" disabled={bookingLoading || nights <= 0}>
                  {bookingLoading ? 'Sending Request...' : 'Request to Book'}
                </button>

                {!isLoggedIn && (
                  <p className="booking-login-note">
                    <Link to="/login">Log in</Link> to book this stay
                  </p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
