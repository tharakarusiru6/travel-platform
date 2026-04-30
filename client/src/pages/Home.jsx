import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import ListingCard from '../components/ListingCard'
import StayCard from '../components/StayCard'
import './Home.css'

const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Pool', 'AC', 'Breakfast', 'Gym', 'Restaurant', 'Laundry', 'Pet Friendly', 'Beach Access']

export default function Home() {
  const [tab, setTab] = useState('experiences') // 'experiences' | 'stays'

  // Experiences state
  const [listings, setListings] = useState([])
  const [listingPage, setListingPage] = useState(1)
  const [listingTotal, setListingTotal] = useState(0)
  const [listingTotalPages, setListingTotalPages] = useState(1)

  // Stays state
  const [stays, setStays] = useState([])
  const [stayPage, setStayPage] = useState(1)
  const [stayTotal, setStayTotal] = useState(0)
  const [stayTotalPages, setStayTotalPages] = useState(1)

  // Shared search
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  // Stay filters
  const [filters, setFilters] = useState({
    location: '', minPrice: '', maxPrice: '',
    checkIn: '', checkOut: '',
    amenities: []
  })

  const [loading, setLoading] = useState(true)

  // Fetch experiences
  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: listingPage, limit: 12 }
      if (search) params.search = search
      const { data } = await api.get('/listings', { params })
      setListings(data.listings)
      setListingTotal(data.total)
      setListingTotalPages(data.totalPages)
    } catch {}
    finally { setLoading(false) }
  }, [listingPage, search])

  // Fetch stays
  const fetchStays = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: stayPage, limit: 12 }
      if (search) params.search = search
      if (filters.location) params.location = filters.location
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.checkIn)  params.checkIn  = filters.checkIn
      if (filters.checkOut) params.checkOut = filters.checkOut
      if (filters.amenities.length > 0) params.amenities = filters.amenities.join(',')
      const { data } = await api.get('/stays', { params })
      setStays(data.stays)
      setStayTotal(data.total)
      setStayTotalPages(data.totalPages)
    } catch {}
    finally { setLoading(false) }
  }, [stayPage, search, filters])

  useEffect(() => {
    if (tab === 'experiences') fetchListings()
    else fetchStays()
  }, [tab, fetchListings, fetchStays])

  const handleSearch = e => {
    e.preventDefault()
    setSearch(searchInput)
    setListingPage(1); setStayPage(1)
  }

  const clearSearch = () => {
    setSearchInput(''); setSearch('')
    setListingPage(1); setStayPage(1)
  }

  const toggleAmenity = (a) => {
    setFilters(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a]
    }))
    setStayPage(1)
  }

  const clearFilters = () => {
    setFilters({ location: '', minPrice: '', maxPrice: '', checkIn: '', checkOut: '', amenities: [] })
    setStayPage(1)
  }

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <p className="hero-eyebrow">Discover the World</p>
          <h1 className="hero-title">
            {tab === 'experiences' ? 'Unforgettable Travel Experiences' : 'Find Your Perfect Stay'}
          </h1>
          <p className="hero-sub">
            {tab === 'experiences'
              ? 'Hand-picked adventures from local experience providers around the globe.'
              : 'Unique hotels and accommodations for every kind of traveler.'}
          </p>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder={tab === 'experiences' ? 'Search experiences, locations...' : 'Search stays, hotels...'}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary search-btn">Search</button>
            {search && <button type="button" onClick={clearSearch} className="btn btn-secondary">Clear</button>}
          </form>

          {/* Tab switcher */}
          <div className="tab-switcher">
            <button
              className={`tab-btn ${tab === 'experiences' ? 'tab-btn--active' : ''}`}
              onClick={() => setTab('experiences')}
            >
              Experiences
            </button>
            <button
              className={`tab-btn ${tab === 'stays' ? 'tab-btn--active' : ''}`}
              onClick={() => setTab('stays')}
            >
              Stays
            </button>
          </div>
        </div>
      </div>

      <div className="container feed-section">

        {/* Stays filters */}
        {tab === 'stays' && (
          <div className="stays-filters">
            <div className="filters-row">
              <div className="filter-group">
                <label>Location</label>
                <input
                  placeholder="e.g. Colombo"
                  value={filters.location}
                  onChange={e => { setFilters(f => ({ ...f, location: e.target.value })); setStayPage(1) }}
                />
              </div>
              <div className="filter-group">
                <label>Min Price ($/night)</label>
                <input
                  type="number" placeholder="0"
                  value={filters.minPrice}
                  onChange={e => { setFilters(f => ({ ...f, minPrice: e.target.value })); setStayPage(1) }}
                />
              </div>
              <div className="filter-group">
                <label>Max Price ($/night)</label>
                <input
                  type="number" placeholder="Any"
                  value={filters.maxPrice}
                  onChange={e => { setFilters(f => ({ ...f, maxPrice: e.target.value })); setStayPage(1) }}
                />
              </div>
              <div className="filter-group">
                <label>Check-in</label>
                <input
                  type="date"
                  value={filters.checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => { setFilters(f => ({ ...f, checkIn: e.target.value })); setStayPage(1) }}
                />
              </div>
              <div className="filter-group">
                <label>Check-out</label>
                <input
                  type="date"
                  value={filters.checkOut}
                  min={filters.checkIn || new Date().toISOString().split('T')[0]}
                  onChange={e => { setFilters(f => ({ ...f, checkOut: e.target.value })); setStayPage(1) }}
                />
              </div>
            </div>

            <div className="amenities-filter">
              <label>Amenities</label>
              <div className="amenities-row">
                {AMENITY_OPTIONS.map(a => (
                  <button
                    key={a}
                    type="button"
                    className={`amenity-filter-btn ${filters.amenities.includes(a) ? 'amenity-filter-btn--active' : ''}`}
                    onClick={() => toggleAmenity(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '0.5rem' }}>
              Clear Filters
            </button>
          </div>
        )}

        {/* Feed header */}
        <div className="feed-header">
          <h2 className="feed-title">
            {tab === 'experiences'
              ? (search ? `Results for "${search}"` : 'All Experiences')
              : (search ? `Stays for "${search}"` : 'All Stays')}
          </h2>
          {!loading && (
            <span className="feed-count">
              {tab === 'experiences' ? listingTotal : stayTotal} found
            </span>
          )}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : tab === 'experiences' ? (
          listings.length === 0 ? (
            <div className="empty-state">
              <h3>No experiences found</h3>
              <p>{search ? 'Try a different search term.' : 'Be the first to add a travel experience!'}</p>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map(l => <ListingCard key={l._id} listing={l} />)}
            </div>
          )
        ) : (
          stays.length === 0 ? (
            <div className="empty-state">
              <h3>No stays found</h3>
              <p>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="listings-grid">
              {stays.map(s => <StayCard key={s._id} stay={s} />)}
            </div>
          )
        )}

        {/* Pagination */}
        {((tab === 'experiences' && listingTotalPages > 1) || (tab === 'stays' && stayTotalPages > 1)) && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={tab === 'experiences' ? listingPage === 1 : stayPage === 1}
              onClick={() => tab === 'experiences' ? setListingPage(p => p - 1) : setStayPage(p => p - 1)}
            >
              Prev
            </button>
            <span className="page-info">
              Page {tab === 'experiences' ? listingPage : stayPage} of {tab === 'experiences' ? listingTotalPages : stayTotalPages}
            </span>
            <button
              className="btn btn-secondary"
              disabled={tab === 'experiences' ? listingPage === listingTotalPages : stayPage === stayTotalPages}
              onClick={() => tab === 'experiences' ? setListingPage(p => p + 1) : setStayPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
