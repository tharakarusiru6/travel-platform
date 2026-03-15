import './StarRating.css'

// Shows stars + number like: ⭐⭐⭐⭐☆ 4.2 / 5 (120 reviews)
// Props:
//   average  — number e.g. 4.2
//   total    — number of reviews
//   size     — 'sm' | 'md' | 'lg'  (default md)
export default function StarRating({ average = 0, total = 0, size = 'md' }) {
  const fullStars = Math.floor(average)
  const hasHalf = average - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)

  return (
    <div className={`star-rating star-rating--${size}`}>
      <div className="stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star star--full">★</span>
        ))}
        {hasHalf && <span className="star star--half">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star star--empty">★</span>
        ))}
      </div>
      {total > 0 ? (
        <span className="rating-text">
          <strong>{average}</strong> / 5
          <span className="rating-count">({total} {total === 1 ? 'review' : 'reviews'})</span>
        </span>
      ) : (
        <span className="rating-text rating-none">No reviews yet</span>
      )}
    </div>
  )
}
