const express = require('express');
const Comment = require('../models/Comment');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true }); // mergeParams gets :listingId from parent

// GET /api/listings/:listingId/comments — get all comments for a listing
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find({ listing: req.params.listingId })
      .populate('author', 'name')
      .populate('replies.author', 'name')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/listings/:listingId/comments — add a comment (protected)
router.post('/', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    // Check if comments are allowed
    if (!listing.commentsAllowed) {
      return res.status(403).json({ message: 'Comments are disabled for this listing.' });
    }

    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const comment = await Comment.create({
      listing: req.params.listingId,
      author: req.user._id,
      text: text.trim()
    });

    await comment.populate('author', 'name');
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/listings/:listingId/comments/:commentId — delete comment (author or listing owner)
router.delete('/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const listing = await Listing.findById(req.params.listingId);

    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isListingOwner = listing.creator.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isListingOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this comment.' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/listings/:listingId/comments/:commentId/reply — any logged in user can reply
router.post('/:commentId/reply', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Reply text is required.' });
    }

    comment.replies.push({ text: text.trim(), author: req.user._id });
    await comment.save();
    await comment.populate('author', 'name');
    await comment.populate('replies.author', 'name');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;