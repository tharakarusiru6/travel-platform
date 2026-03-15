import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import './RatingInput.css'

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']

export default function RatingInput({ listingId, onRatingUpdate }) {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [userRating, setUserRating] = useState(0)   // saved rating
  const [hovered, setHovered] = useState(0)          // star being hovered
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  // Load user's existing rating
  useEffect(() => {
    if (!isLoggedIn) return
    api.get(`/listings/${listingId}/ratings`)
      .then(({ data }) => {
        if (data.userRating) setUserRating(data.userRating)
        setFetched(true)
      })
      .catch(() => setFetched(true))
  }, [listingId, isLoggedIn])

  const handleClick = async (stars) => {
    if (!isLoggedIn) {
      toast.error('Please log in to rate this experience')
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post(`/listings/${listingId}/ratings`, { stars })
      setUserRating(stars)
      onRatingUpdate(data)    // update parent with new average + total
      toast.success(`You rated this ${stars} star${stars > 1 ? 's' : ''}! ${LABELS[stars]}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  const display = hovered || userRating

  return (
    <div className="rating-input">
      <div className="rating-input__label">
        {!isLoggedIn
          ? 'Log in to rate this experience'
          : userRating
            ? `Your rating: ${LABELS[userRating]} — click to change`
            : 'Rate this experience'}
      </div>

      <div className="rating-input__stars">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className={`rating-star ${star <= display ? 'rating-star--active' : ''} ${loading ? 'rating-star--loading' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            disabled={loading}
            title={LABELS[star]}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}

        {display > 0 && (
          <span className="rating-input__hint">{LABELS[display]}</span>
        )}
      </div>
    </div>
  )
}
