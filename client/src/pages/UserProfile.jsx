import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import UserAvatar from '../components/UserAvatar'
import ListingCard from '../components/ListingCard'
import toast from 'react-hot-toast'
import './UserProfile.css'

export default function UserProfile() {
  const { userId } = useParams()
  const { user, isLoggedIn, updateUser } = useAuth()
  const isOwnProfile = isLoggedIn && user?._id === userId

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '', photo: '', about: '',
    phone: '', phonePublic: false,
    socialMedia: { instagram: '', facebook: '', twitter: '' },
    socialPublic: false
  })

  useEffect(() => {
    setLoading(true)
    api.get(`/profile/${userId}`)
      .then(({ data }) => {
        setProfile(data)
        setForm({
          name: data.name || '',
          photo: data.photo || '',
          about: data.about || '',
          phone: data.phone || '',
          phonePublic: data.phonePublic || false,
          socialMedia: data.socialMedia || { instagram: '', facebook: '', twitter: '' },
          socialPublic: data.socialPublic || false
        })
      })
      .catch(() => toast.error('Profile not found'))
      .finally(() => setLoading(false))
  }, [userId])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSocialChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, socialMedia: { ...f.socialMedia, [name]: value } }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/profile', form)
      setProfile(prev => ({ ...prev, ...data, listings: prev.listings }))
      updateUser({ name: data.name, photo: data.photo })  // update navbar
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="spinner" style={{ marginTop: '20vh' }} />
  if (!profile) return null

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="profile-page page-enter">
      <div className="container">

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-header__avatar">
            {editing ? (
              <div className="avatar-edit-wrap">
                <UserAvatar user={{ ...user, photo: form.photo }} size="xl" linkable={false} />
                <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  <label>Photo URL</label>
                  <input name="photo" value={form.photo} onChange={handleChange} placeholder="https://..." />
                </div>
              </div>
            ) : (
              <UserAvatar user={profile} size="xl" linkable={false} />
            )}
          </div>

          <div className="profile-header__info">
            {editing ? (
              <div className="form-group">
                <label>Name</label>
                <input name="name" value={form.name} onChange={handleChange} />
              </div>
            ) : (
              <h1 className="profile-name">{profile.name}</h1>
            )}

            <p className="profile-joined">Member since {joinedDate}</p>

            {/* About */}
            {editing ? (
              <div className="form-group">
                <label>About <span style={{ color: 'var(--mist)', fontWeight: 400 }}>({form.about.length}/200 characters)</span></label>
                <textarea
                  name="about" value={form.about} onChange={handleChange}
                  placeholder="Tell travelers about yourself..." maxLength={200}
                  style={{ minHeight: '80px' }}
                />
              </div>
            ) : (
              profile.about && <p className="profile-about">{profile.about}</p>
            )}

            {/* Phone */}
            {editing ? (
              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+94 77 123 4567" />
                <label className="toggle-label" style={{ marginTop: '0.5rem' }}>
                  <input type="checkbox" name="phonePublic" checked={form.phonePublic} onChange={handleChange} className="toggle-checkbox" />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">{form.phonePublic ? ' Phone is Public' : ' Phone is Private'}</span>
                </label>
              </div>
            ) : (
              profile.phone && profile.phonePublic && (
                <p className="profile-phone"> {profile.phone}</p>
              )
            )}

            {/* Social Media */}
            {editing ? (
              <div className="form-group">
                <label>Social Media</label>
                <div className="social-inputs">
                  <input name="instagram" value={form.socialMedia.instagram} onChange={handleSocialChange} placeholder="Instagram username" />
                  <input name="facebook"  value={form.socialMedia.facebook}  onChange={handleSocialChange} placeholder="Facebook username" />
                  <input name="twitter"   value={form.socialMedia.twitter}   onChange={handleSocialChange} placeholder="X / Twitter username" />
                </div>
                <label className="toggle-label" style={{ marginTop: '0.5rem' }}>
                  <input type="checkbox" name="socialPublic" checked={form.socialPublic} onChange={handleChange} className="toggle-checkbox" />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">{form.socialPublic ? ' Social links are Public' : ' Social links are Private'}</span>
                </label>
              </div>
            ) : (
              profile.socialMedia && profile.socialPublic && (
                <div className="profile-socials">
                  {profile.socialMedia.instagram && (
                    <a href={`https://instagram.com/${profile.socialMedia.instagram}`} target="_blank" rel="noreferrer" className="social-link social-link--ig"> Instagram</a>
                  )}
                  {profile.socialMedia.facebook && (
                    <a href={`https://facebook.com/${profile.socialMedia.facebook}`} target="_blank" rel="noreferrer" className="social-link social-link--fb"> Facebook</a>
                  )}
                  {profile.socialMedia.twitter && (
                    <a href={`https://twitter.com/${profile.socialMedia.twitter}`} target="_blank" rel="noreferrer" className="social-link social-link--tw"> X / Twitter</a>
                  )}
                </div>
              )
            )}

            {/* Edit / Save buttons — only own profile */}
            {isOwnProfile && (
              <div className="profile-actions">
                {editing ? (
                  <>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                  </>
                ) : (
                  <button className="btn btn-ocean" onClick={() => setEditing(true)}> Edit Profile</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Listings */}
        <div className="profile-listings">
          <h2 className="profile-listings__title">
            {isOwnProfile ? 'My Experiences' : `${profile.name}'s Experiences`}
            <span className="profile-listings__count">{profile.listings?.length || 0}</span>
          </h2>

          {profile.listings?.length === 0 ? (
            <div className="empty-state">
              <h3>No experiences yet</h3>
              {isOwnProfile && (
                <Link to="/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  + Share your first experience
                </Link>
              )}
            </div>
          ) : (
            <div className="listings-grid">
              {profile.listings.map(listing => (
                <ListingCard key={listing._id} listing={{ ...listing, creator: profile }} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
