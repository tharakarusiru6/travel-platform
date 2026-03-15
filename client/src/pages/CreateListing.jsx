import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import './ListingForm.css'

const INITIAL = { title: '', location: '', imageUrl: '', description: '', price: '', commentsAllowed: true }

export default function CreateListing() {
  const [form, setForm] = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState('')
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'imageUrl') setPreview(value)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : null
      }
      const { data } = await api.post('/listings', payload)
      toast.success('Experience created! 🎉')
      navigate(`/listings/${data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page page-enter">
      <div className="container">
        <div className="form-layout">
          <div className="form-sidebar">
            <h1>Share an Experience</h1>
            <p>Let travelers discover what makes your destination special.</p>
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}
          </div>

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Experience Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Sunset Boat Tour" required minLength={3} />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Bali, Indonesia" required />
              </div>
              <div className="form-group">
                <label>Image URL *</label>
                <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://images.unsplash.com/..." required />
                <small style={{ color: 'var(--mist)', fontSize: '0.8rem' }}>
                  Tip: Use <a href="https://unsplash.com" target="_blank" rel="noreferrer" style={{ color: 'var(--terracotta)' }}>Unsplash.com</a> for free images
                </small>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe this experience in detail..." required minLength={10} />
              </div>
              <div className="form-group">
                <label>Price (USD) — optional</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="e.g. 45" min="0" step="0.01" />
              </div>

              {/* ✅ NEW — Comments toggle */}
              <div className="form-group toggle-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    name="commentsAllowed"
                    checked={form.commentsAllowed}
                    onChange={handleChange}
                    className="toggle-checkbox"
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">
                    {form.commentsAllowed ? '💬 Comments enabled' : '🚫 Comments disabled'}
                  </span>
                </label>
                <small style={{ color: 'var(--mist)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  You can change this anytime by editing the listing
                </small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Experience ✦'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
