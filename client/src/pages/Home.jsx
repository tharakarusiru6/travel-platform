import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../utils/api'
import ListingCard from '../components/ListingCard'
import StayCard from '../components/StayCard'
import './Home.css'

const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Pool', 'AC', 'Breakfast', 'Gym', 'Restaurant', 'Laundry', 'Pet Friendly', 'Beach Access']

const HERO_VISUALS = {
  experiences: [
    {
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      caption: 'Ocean route',
    },
    {
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80',
      caption: 'Mountain trek',
    },
    {
      image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&q=80',
      caption: 'City lights',
    },
    {
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
      caption: 'Golden-hour trail',
    },
  ],
  stays: [
    {
      image: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb21080?w=1200&q=80',
      caption: 'Coastal retreat',
    },
    {
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
      caption: 'Modern suite',
    },
    {
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
      caption: 'Tropical villa',
    },
    {
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
      caption: 'Design-led stay',
    },
  ],
}

const HERO_VISUAL_STORAGE_KEY = 'travelnest.home.hero-visual'

function getStoredHeroIndex(tab) {
  if (typeof window === 'undefined') return -1

  const stored = window.sessionStorage.getItem(`${HERO_VISUAL_STORAGE_KEY}:${tab}`)
  const parsed = Number.parseInt(stored ?? '', 10)
  return Number.isFinite(parsed) ? parsed : -1
}

function setStoredHeroIndex(tab, index) {
  if (typeof window === 'undefined') return

  window.sessionStorage.setItem(`${HERO_VISUAL_STORAGE_KEY}:${tab}`, String(index))
}

function advanceHeroVisual(tab) {
  const visuals = HERO_VISUALS[tab]

  if (!visuals || visuals.length === 0) {
    return { image: '', caption: '', key: `${tab}-empty` }
  }

  const storedIndex = getStoredHeroIndex(tab)
  const nextIndex = visuals.length === 1
    ? 0
    : storedIndex >= 0
      ? (storedIndex + 1) % visuals.length
      : Math.floor(Math.random() * visuals.length)

  setStoredHeroIndex(tab, nextIndex)

  return {
    ...visuals[nextIndex],
    key: `${tab}-${nextIndex}-${Date.now()}`,
  }
}

export default function Home() {
  const [tab, setTab] = useState('experiences') // 'experiences' | 'stays'
  const didMountRef = useRef(false)

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
  const [heroVisual, setHeroVisual] = useState(() => advanceHeroVisual('experiences'))
  const activeTotal = tab === 'experiences' ? listingTotal : stayTotal
  const activeTotalPages = tab === 'experiences' ? listingTotalPages : stayTotalPages
  const heroTitle = tab === 'experiences' ? 'Travel stories that feel lived in.' : 'Stays that feel worth the trip.'
  const heroSubtitle = tab === 'experiences'
    ? 'Browse hand-picked experiences, save the ones that stand out, and publish your own journey when you are ready.'
    : 'Discover stays curated for comfort, location, and style, then book directly with the host that fits your trip.'
  const heroSpotlight = tab === 'experiences'
    ? {
        label: 'Featured experience',
        title: 'Sunset trails, private guides, and quiet dinners.',
        detail: 'Designed for travelers who want the memorable version of a city, not the generic one.',
        stat: 'Local-first'
      }
    : {
        label: 'Featured stay',
        title: 'Boutique rooms, ocean views, and a slower arrival.',
        detail: 'A calm booking experience with filters that help travelers find the right place fast.',
        stat: 'Book direct'
      }
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

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }

    setHeroVisual(advanceHeroVisual(tab))
  }, [tab])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroVisual(advanceHeroVisual(tab))
    }, 30000)

    return () => window.clearInterval(timer)
  }, [tab])

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
        <div className="container hero-shell">
          <div className="hero-copy">
            <p className="hero-eyebrow">Discover the world</p>
            <div className="hero-ribbon">
              <span>Private escapes</span>
              <span>Curated stays</span>
              <span>Signature journeys</span>
            </div>
            <h1 className="hero-title">{heroTitle}</h1>
            <p className="hero-sub">{heroSubtitle}</p>

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

            <div className="tab-switcher" role="tablist" aria-label="Browse content type">
              <button
                type="button"
                className={`tab-btn ${tab === 'experiences' ? 'tab-btn--active' : ''}`}
                onClick={() => setTab('experiences')}
              >
                Experiences
              </button>
              <button
                type="button"
                className={`tab-btn ${tab === 'stays' ? 'tab-btn--active' : ''}`}
                onClick={() => setTab('stays')}
              >
                Stays
              </button>
            </div>

            <p className="hero-note">
              {tab === 'experiences'
                ? 'A magazine-style browse for journeys worth remembering.'
                : 'A calmer booking surface for refined stays and direct reservations.'}
            </p>
          </div>

          <div className="hero-panel">
            <div className="hero-panel__card hero-panel__card--primary">
              <div key={heroVisual.key} className="hero-panel__art" style={{ backgroundImage: `url(${heroVisual.image})` }}>
                <div className="hero-panel__art-overlay" />
                <span className="hero-panel__art-caption">{heroVisual.caption}</span>
              </div>
              <span className="hero-panel__badge">{heroSpotlight.label}</span>
              <h2>{heroSpotlight.title}</h2>
              <p>{heroSpotlight.detail}</p>
              <div className="hero-panel__footer">
                <span>{heroSpotlight.stat}</span>
                <span>{tab === 'experiences' ? 'Stories, places, creators' : 'Rooms, hosts, dates'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container feed-section">
        <div className="browse-strip">
          <div>
            <p className="browse-strip__eyebrow">Browse mode</p>
            <h2>{tab === 'experiences' ? 'Curated experiences and creator stories' : 'Stay discovery made calmer and faster'}</h2>
          </div>
          <p className="browse-strip__text">
            {tab === 'experiences'
              ? 'Find adventures with a cleaner layout, clearer hierarchy, and a stronger sense of destination.'
              : 'Switch to stays for booking-ready cards, better filtering, and a layout built for comparison.'}
          </p>
        </div>

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
          <div>
            <p className="feed-kicker">{tab === 'experiences' ? 'Featured feed' : 'Stay feed'}</p>
            <h2 className="feed-title">
              {tab === 'experiences'
                ? (search ? `Results for "${search}"` : 'All Experiences')
                : (search ? `Stays for "${search}"` : 'All Stays')}
            </h2>
          </div>
          {!loading && (
            <span className="feed-count">
              {activeTotal} found
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
              Page {tab === 'experiences' ? listingPage : stayPage} of {activeTotalPages}
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
