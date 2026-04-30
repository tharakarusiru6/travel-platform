import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import './ListingForm.css'

const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Pool', 'AC', 'Breakfast', 'Gym', 'Restaurant', 'Laundry', 'Pet Friendly', 'Beach Access']

export default function EditStay() {
  const { id } = useParams()
  const [form, setForm] = useState({ name: '', location: '', imageUrl: '', description: '', pricePerNight: '', amenities: [] })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/stays/' + id)
      .then(({ data }) => {
        setForm({
          name: data.name,
          location: data.location,
          imageUrl: data.imageUrl,
          description: data.description,
          pricePerNight: data.pricePerNight,
          amenities: data.amenities || []
        })
      })
      .catch(() => { toast.error('Stay not found'); navigate('/') })
      .finally(() => setFetching(false))
  }, [id])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const toggleAmenity = (a) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter(x => x !== a)
        : [...f.amenities, a]
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/stays/' + id, { ...form, pricePerNight: Number(form.pricePerNight) })
      toast.success('Stay updated!')
      navigate('/stays/' + id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="spinner" style={{ marginTop: '20vh' }} />

  return (
    <div className="form-page page-enter">
      <div className="container">
        <div className="form-layout">
          <div className="form-sidebar">
            <h1>Edit Property</h1>
            <p>Update your stay listing details below.</p>
            {form.imageUrl && (
              <div className="image-preview">
                <img src={form.imageUrl} alt="Preview" onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}
          </div>
          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Property Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input name="location" value={form.location} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Image URL *</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Price Per Night (USD) *</label>
                <input type="number" name="pricePerNight" value={form.pricePerNight} onChange={handleChange} min="1" required />
              </div>
              <div className="form-group">
                <label>Amenities</label>
                <div className="amenities-selector">
                  {AMENITY_OPTIONS.map(a => (
                    <button key={a} type="button"
                      className={'amenity-select-btn' + (form.amenities.includes(a) ? ' amenity-select-btn--active' : '')}
                      onClick={() => toggleAmenity(a)}
                    >{a}</button>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/stays/' + id)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
