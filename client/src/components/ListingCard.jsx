import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'
import StarRating from './StarRating'
import UserAvatar from './UserAvatar'
import './ListingCard.css'

export default function ListingCard({ listing }) {
  const { _id, title, location, imageUrl, description, price, creator, createdAt, likes } = listing
  const [rating, setRating] = useState({ average: 0, total: 0 })

  // ✅ FIX — always fetch latest creator profile so updated photo shows
  const [latestCreator, setLatestCreator] = useState(creator)

  useEffect(() => {
    // Fetch ratings
    api.get(`/listings/${_id}/ratings`)
      .then(({ data }) => setRating({ average: data.average, total: data.total }))
      .catch(() => {})

    // Fetch latest creator profile to get updated photo and name
    if (creator?._id) {
      api.get(`/profile/${creator._id}`)
        .then(({ data }) => setLatestCreator({
          _id: data._id,
          name: data.name,
          photo: data.photo
        }))
        .catch(() => {}) // fallback to original creator if fails
    }
  }, [_id, creator?._id])

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  return (
    <Link to={`/listings/${_id}`} className="listing-card">
      <div className="card-image-wrap">
        <img
          src={imageUrl} alt={title} className="card-image"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80' }}
        />
        {price != null && <span className="card-price">${price}</span>}
        {likes?.length > 0 && <span className="card-likes">♥ {likes.length}</span>}
      </div>

      <div className="card-body">
        <div className="card-location"> {location}</div>
        <h3 className="card-title">{title}</h3>

        <div className="card-rating">
          <StarRating average={rating.average} total={rating.total} size="sm" />
        </div>

        <p className="card-desc">{description}</p>

        <div className="card-footer">
          <div className="card-creator-info">
            {/* ✅ FIX — latestCreator has the updated photo */}
            <UserAvatar user={latestCreator} size="sm" linkable={true} />
            <Link
              to={`/profile/${latestCreator?._id}`}
              className="card-creator-name"
              onClick={e => e.stopPropagation()}
            >
              {latestCreator?.name}
            </Link>
          </div>
          <span className="card-time">{timeAgo}</span>
        </div>
      </div>
    </Link>
  )
}