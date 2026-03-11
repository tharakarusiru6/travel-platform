import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import './ListingCard.css'

export default function ListingCard({ listing }) {
  const { _id, title, location, imageUrl, description, price, creator, createdAt, likes } = listing

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  return (
    <Link to={`/listings/${_id}`} className="listing-card">
      <div className="card-image-wrap">
        <img
          src={imageUrl}
          alt={title}
          className="card-image"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80' }}
        />
        {price != null && (
          <span className="card-price">${price}</span>
        )}
        {likes?.length > 0 && (
          <span className="card-likes">♥ {likes.length}</span>
        )}
      </div>
      <div className="card-body">
        <div className="card-location">📍 {location}</div>
        <h3 className="card-title">{title}</h3>
        <p className="card-desc">{description}</p>
        <div className="card-footer">
          <span className="card-creator">by {creator?.name}</span>
          <span className="card-time">{timeAgo}</span>
        </div>
      </div>
    </Link>
  )
}
