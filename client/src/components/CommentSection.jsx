import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import UserAvatar from './UserAvatar'
import './CommentSection.css'

export default function CommentSection({ listingId, commentsAllowed, isOwner }) {
  const { user, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyText, setReplyText] = useState({})
  const [replyOpen, setReplyOpen] = useState({})

  useEffect(() => {
    api.get(`/listings/${listingId}/comments`)
      .then(({ data }) => setComments(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [listingId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { navigate('/login'); return }
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/listings/${listingId}/comments`, { text })
      setComments(prev => [data, ...prev])
      setText('')
      toast.success('Comment added!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/listings/${listingId}/comments/${commentId}`)
      setComments(prev => prev.filter(c => c._id !== commentId))
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  const handleReply = async (commentId) => {
    const replyContent = replyText[commentId]
    if (!replyContent?.trim()) return
    try {
      const { data } = await api.post(`/listings/${listingId}/comments/${commentId}/reply`, { text: replyContent })
      setComments(prev => prev.map(c => c._id === commentId ? data : c))
      setReplyText(prev => ({ ...prev, [commentId]: '' }))
      setReplyOpen(prev => ({ ...prev, [commentId]: false }))
      toast.success('Reply added!')
    } catch {
      toast.error('Failed to add reply')
    }
  }

  return (
    <div className="comment-section">
      <h3 className="comment-title">
        Comments
        {!commentsAllowed && <span className="comments-disabled-badge">Disabled</span>}
      </h3>

      {/* Comment Input */}
      {commentsAllowed ? (
        isLoggedIn ? (
          <form onSubmit={handleSubmit} className="comment-form">
            <div className="comment-input-row">
              {/* FIX 1 — use UserAvatar instead of old initials div */}
              <UserAvatar user={user} size="sm" linkable={false} />
              <input
                type="text"
                placeholder="Write a comment..."
                value={text}
                onChange={e => setText(e.target.value)}
                className="comment-input"
                maxLength={500}
              />
              <button type="submit" className="btn btn-primary comment-submit" disabled={submitting || !text.trim()}>
                {submitting ? '...' : 'Post'}
              </button>
            </div>
          </form>
        ) : (
          <div className="comment-login-prompt">
            <span>Please </span>
            <button onClick={() => navigate('/login')} className="login-link">log in</button>
            <span> to leave a comment.</span>
          </div>
        )
      ) : (
        <div className="comments-off-msg">
          The experience owner has disabled comments on this listing.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="comment-loading">Loading comments...</div>
      ) : comments.length === 0 ? (
        commentsAllowed && <div className="no-comments">No comments yet. Be the first!</div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment-card">
              <div className="comment-header">
                {/* FIX 2 — UserAvatar for comment author */}
                <UserAvatar user={comment.author} size="sm" linkable={true} />
                <div className="comment-meta">
                  <Link to={`/profile/${comment.author?._id}`} className="comment-author-link">
                    {comment.author?.name}
                  </Link>
                  <span className="comment-time">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {isLoggedIn && (comment.author?._id === user._id || isOwner) && (
                  <button
                    className="comment-delete"
                    onClick={() => handleDelete(comment._id)}
                    title="Delete comment"
                  >x</button>
                )}
              </div>

              <p className="comment-text">{comment.text}</p>

              {/* Replies */}
              {comment.replies?.length > 0 && (
                <div className="replies-list">
                  {comment.replies.map((reply, i) => (
                    <div key={i} className="reply-card">
                      {/* FIX 3 — UserAvatar for reply author */}
                      <UserAvatar user={reply.author} size="sm" linkable={true} />
                      <div className="reply-body">
                        <div className="reply-header">
                          <Link to={`/profile/${reply.author?._id}`} className="reply-author-link">
                            {reply.author?.name}
                          </Link>
                          <span className="comment-time">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="reply-text">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply input */}
              {isLoggedIn && commentsAllowed && (
                <div className="reply-section">
                  {replyOpen[comment._id] ? (
                    <div className="reply-input-row">
                      <input
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText[comment._id] || ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                        className="reply-input"
                        maxLength={500}
                      />
                      <button
                        className="btn btn-ocean reply-btn"
                        onClick={() => handleReply(comment._id)}
                        disabled={!replyText[comment._id]?.trim()}
                      >Reply</button>
                      <button
                        className="btn btn-secondary reply-btn"
                        onClick={() => setReplyOpen(prev => ({ ...prev, [comment._id]: false }))}
                      >Cancel</button>
                    </div>
                  ) : (
                    <button
                      className="reply-toggle"
                      onClick={() => setReplyOpen(prev => ({ ...prev, [comment._id]: true }))}
                    >Reply</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}