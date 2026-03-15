const express = require('express');
const Rating = require('../models/Rating');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// GET /api/listings/:listingId/ratings — get rating summary + user's own rating
router.get('/', async (req, res) => {
  try {
    const ratings = await Rating.find({ listing: req.params.listingId });

    const total = ratings.length;
    const average = total > 0
      ? Math.round((ratings.reduce((sum, r) => sum + r.stars, 0) / total) * 10) / 10
      : 0;

    // Check if current user already rated (token optional)
    let userRating = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        const existing = await Rating.findOne({ listing: req.params.listingId, user: decoded.id });
        if (existing) userRating = existing.stars;
      } catch {}
    }

    res.json({ average, total, userRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/listings/:listingId/ratings — submit or update rating (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { stars } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars.' });
    }

    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    // Upsert — update if exists, create if not
    await Rating.findOneAndUpdate(
      { listing: req.params.listingId, user: req.user._id },
      { stars },
      { upsert: true, new: true }
    );

    // Recalculate
    const ratings = await Rating.find({ listing: req.params.listingId });
    const total = ratings.length;
    const average = Math.round((ratings.reduce((sum, r) => sum + r.stars, 0) / total) * 10) / 10;

    res.json({ average, total, userRating: stars });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
