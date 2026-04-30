import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import './ListingForm.css'

const AMENITY_OPTIONS = ['WiFi', 'Parking', 'Pool', 'AC', 'Breakfast', 'Gym', 'Restaurant', 'Laundry', 'Pet Friendly', 'Beach Access']

const INITIAL = { name: '', location: '', imageUrl: '', description: '', pricePerNight: '', amenities: [] }

export default function CreateStay() {
  const [form, setForm] = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState('')
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'imageUrl') setPreview(value)
  }

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
      const { data } = await api.post('/stays', {
        ...form,
        pricePerNight: Number(form.pricePerNight)
      })
      toast.success('Stay listed successfully!')
      navigate('/stays/' + data._id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create stay')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page page-enter">
      <div className="container">
        <div className="form-layout">
          <div className="form-sidebar">
            <h1>List Your Property</h1>
            <p>Share your hotel or accommodation with travelers around the world.</p>
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}
          </div>

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Property Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Ocean View Hotel" required minLength={3} />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Colombo, Sri Lanka" required />
              </div>
              <div className="form-group">
                <label>Image URL *</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/..." required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your property..." required minLength={10} />
              </div>
              <div className="form-group">
                <label>Price Per Night (USD) *</label>
                <input type="number" name="pricePerNight" value={form.pricePerNight} onChange={handleChange} placeholder="e.g. 80" min="1" required />
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
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Publishing...' : 'List Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
