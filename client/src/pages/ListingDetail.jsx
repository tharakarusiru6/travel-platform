import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import CommentSection from '../components/CommentSection'
import StarRating from '../components/StarRating'       // ✅ NEW
import RatingInput from '../components/RatingInput'     // ✅ NEW
import './ListingDetail.css'

export default function ListingDetail() {
  const { id } = useParams()
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [likeLoading, setLikeLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [rating, setRating] = useState({ average: 0, total: 0 }) // ✅ NEW

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(({ data }) => setListing(data))
      .catch(() => { toast.error('Listing not found'); navigate('/') })
      .finally(() => setLoading(false))

    // ✅ NEW — fetch rating summary
    api.get(`/listings/${id}/ratings`)
      .then(({ data }) => setRating({ average: data.average, total: data.total }))
      .catch(() => {})
  }, [id])

  const isOwner = user && listing?.creator?._id === user._id

  const handleLike = async () => {
    if (!isLoggedIn) { toast.error('Please log in to like listings'); return }
    setLikeLoading(true)
    try {
      const { data } = await api.post(`/listings/${id}/like`)
      setListing(l => ({
        ...l,
        likes: data.liked
          ? [...(l.likes || []), user._id]
          : (l.likes || []).filter(uid => uid !== user._id)
      }))
    } catch {
      toast.error('Failed to update like')
    } finally {
      setLikeLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/listings/${id}`)
      toast.success('Listing deleted')
      navigate('/')
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }} />
  if (!listing) return null

  const isLiked = isLoggedIn && listing.likes?.includes(user._id)
  const likeCount = listing.likes?.length || 0

  return (
    <div className="detail-page page-enter">
      <div className="container">
        <Link to="/" className="back-btn">← Back to Feed</Link>

        <div className="detail-layout">
          <div className="detail-image-wrap">
            <img
              src={listing.imageUrl} alt={listing.title}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80' }}
            />

            {/* ✅ NEW — Rating summary on image */}
            {rating.total > 0 && (
              <div className="image-rating-badge">
                <StarRating average={rating.average} total={rating.total} size="sm" />
              </div>
            )}
          </div>

          <div className="detail-content">
            <div className="detail-location">📍 {listing.location}</div>
            <h1 className="detail-title">{listing.title}</h1>

            {/* ✅ NEW — Large rating display under title */}
            <div className="detail-rating-display">
              <StarRating average={rating.average} total={rating.total} size="lg" />
            </div>

            <div className="detail-meta">
              <div className="detail-creator">
                <div className="creator-avatar">{listing.creator?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div className="creator-name">{listing.creator?.name}</div>
                  <div className="creator-time">
                    {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
              {listing.price != null && (
                <div className="detail-price">${listing.price} <span>per person</span></div>
              )}
            </div>

            <div className="detail-desc">
              <h3>About this experience</h3>
              <p>{listing.description}</p>
            </div>

            {/* ✅ NEW — Interactive rating input */}
            <RatingInput
              listingId={id}
              onRatingUpdate={(data) => setRating({ average: data.average, total: data.total })}
            />

            <div className="detail-actions">
              <button
                className={`btn like-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike} disabled={likeLoading}
              >
                {isLiked ? '♥' : '♡'} {likeCount > 0 ? likeCount : ''} {isLiked ? 'Liked' : 'Like'}
              </button>

              {isOwner && (
                <>
                  <Link to={`/edit/${id}`} className="btn btn-ocean">✏️ Edit</Link>
                  {!deleteConfirm ? (
                    <button className="btn btn-danger" onClick={() => setDeleteConfirm(true)}>🗑 Delete</button>
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

            <CommentSection
              listingId={id}
              commentsAllowed={listing.commentsAllowed}
              isOwner={isOwner}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
