import { Link } from 'react-router-dom'
import './UserAvatar.css'

// Shows profile photo or initials fallback
// Props: user { _id, name, photo }, size: 'sm'|'md'|'lg', linkable: bool
export default function UserAvatar({ user, size = 'md', linkable = true }) {
  const initials = user?.name?.[0]?.toUpperCase() || '?'

  const avatar = (
    <div className={`user-avatar user-avatar--${size}`}>
      {user?.photo ? (
        <img src={user.photo} alt={user.name} className="user-avatar__img"
          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
        />
      ) : null}
      <span className="user-avatar__initials" style={{ display: user?.photo ? 'none' : 'flex' }}>
        {initials}
      </span>
    </div>
  )

  if (linkable && user?._id) {
    return <Link to={`/profile/${user._id}`} className="user-avatar-link" onClick={e => e.stopPropagation()}>{avatar}</Link>
  }
  return avatar
}
