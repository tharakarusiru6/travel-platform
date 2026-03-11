import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import ListingCard from '../components/ListingCard'
import './Home.css'

export default function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (search) params.search = search
      const { data } = await api.get('/listings', { params })
      setListings(data.listings)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  return (
    <div className="home-page page-enter">
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <p className="hero-eyebrow">Discover the World</p>
          <h1 className="hero-title">Unforgettable Travel<br />Experiences Await</h1>
          <p className="hero-sub">Hand-picked adventures from local experience providers around the globe.</p>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search experiences, locations..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary search-btn">Search</button>
            {search && (
              <button type="button" onClick={clearSearch} className="btn btn-secondary">Clear</button>
            )}
          </form>
        </div>
      </div>

      {/* Feed */}
      <div className="container feed-section">
        <div className="feed-header">
          <h2 className="feed-title">
            {search ? `Results for "${search}"` : 'All Experiences'}
          </h2>
          {!loading && <span className="feed-count">{total} experience{total !== 1 ? 's' : ''}</span>}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌍</div>
            <h3>No experiences found</h3>
            <p>{search ? 'Try a different search term.' : 'Be the first to add a travel experience!'}</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map(listing => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ← Prev
            </button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button
              className="btn btn-secondary"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
