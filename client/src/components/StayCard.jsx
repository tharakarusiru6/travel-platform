import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import StarRating from './StarRating'
import UserAvatar from './UserAvatar'
import './StayCard.css'

export default function StayCard({ stay }) {
  const { _id, name, location, imageUrl, description, pricePerNight, owner, likes, amenities } = stay
  const [rating, setRating] = useState({ average: 0, total: 0 })
  const [latestOwner, setLatestOwner] = useState(owner)

  useEffect(() => {
    if (owner?._id) {
      api.get(`/profile/${owner._id}`)
        .then(({ data }) => setLatestOwner({ _id: data._id, name: data.name, photo: data.photo }))
        .catch(() => {})
    }
  }, [owner?._id])

  return (
    <Link to={`/stays/${_id}`} className="stay-card">
      <div className="stay-card__image-wrap">
        <img
          src={imageUrl} alt={name} className="stay-card__image"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80' }}
        />
        <span className="stay-card__price">${pricePerNight}<span>/night</span></span>
        {likes?.length > 0 && <span className="stay-card__likes">♥ {likes.length}</span>}
      </div>

      <div className="stay-card__body">
        <div className="stay-card__location">📍 {location}</div>
        <h3 className="stay-card__name">{name}</h3>

        <StarRating average={rating.average} total={rating.total} size="sm" />

        {amenities?.length > 0 && (
          <div className="stay-card__amenities">
            {amenities.slice(0, 3).map(a => (
              <span key={a} className="amenity-tag">{a}</span>
            ))}
            {amenities.length > 3 && <span className="amenity-tag amenity-tag--more">+{amenities.length - 3}</span>}
          </div>
        )}

        <p className="stay-card__desc">{description}</p>

        <div className="stay-card__footer">
          <div className="stay-card__owner">
            <UserAvatar user={latestOwner} size="sm" linkable={true} />
            <Link
              to={`/profile/${latestOwner?._id}`}
              className="stay-card__owner-name"
              onClick={e => e.stopPropagation()}
            >
              {latestOwner?.name}
            </Link>
          </div>
        </div>
      </div>
    </Link>
  )
}
