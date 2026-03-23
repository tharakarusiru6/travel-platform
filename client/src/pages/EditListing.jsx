import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import './ListingForm.css'

export default function EditListing() {
  const { id } = useParams()
  const [form, setForm] = useState({ title: '', location: '', imageUrl: '', description: '', price: '', commentsAllowed: true })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(({ data }) => {
        setForm({
          title: data.title,
          location: data.location,
          imageUrl: data.imageUrl,
          description: data.description,
          price: data.price ?? '',
          commentsAllowed: data.commentsAllowed !== undefined ? data.commentsAllowed : true // ✅ NEW
        })
      })
      .catch(() => { toast.error('Listing not found'); navigate('/') })
      .finally(() => setFetching(false))
  }, [id])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, price: form.price !== '' ? Number(form.price) : null }
      await api.put(`/listings/${id}`, payload)
      toast.success('Listing updated!')
      navigate(`/listings/${id}`)
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
            <h1>Edit Experience</h1>
            <p>Update your listing details below.</p>
            {form.imageUrl && (
              <div className="image-preview">
                <img src={form.imageUrl} alt="Preview" onError={e => { e.target.style.display = 'none' }} />
              </div>
            )}
          </div>

          <div className="form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Experience Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required />
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
                <label>Price (USD) — optional</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} min="0" step="0.01" />
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
                    {form.commentsAllowed ? ' Comments enabled' : ' Comments disabled'}
                  </span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => navigate(`/listings/${id}`)}>Cancel</button>
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
