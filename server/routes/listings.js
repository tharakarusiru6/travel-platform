const express = require('express');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/listings
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;
    let query = {};
    if (search) query = { $text: { $search: search } };

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate('creator', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Listing.countDocuments(query)
    ]);

    res.json({ listings, totalPages: Math.ceil(total / limit), currentPage: Number(page), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('creator', 'name email');
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/listings
router.post('/', protect, async (req, res) => {
  try {
    const { title, location, imageUrl, description, price, commentsAllowed } = req.body;
    if (!title || !location || !imageUrl || !description) {
      return res.status(400).json({ message: 'Title, location, image URL, and description are required.' });
    }

    const listing = await Listing.create({
      title, location, imageUrl, description,
      price: price || null,
      creator: req.user._id,
      commentsAllowed: commentsAllowed !== undefined ? commentsAllowed : true // ✅ NEW
    });

    await listing.populate('creator', 'name email');
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/listings/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this listing.' });
    }

    const { title, location, imageUrl, description, price, commentsAllowed } = req.body;
    listing.title = title || listing.title;
    listing.location = location || listing.location;
    listing.imageUrl = imageUrl || listing.imageUrl;
    listing.description = description || listing.description;
    listing.price = price !== undefined ? price : listing.price;
    if (commentsAllowed !== undefined) listing.commentsAllowed = commentsAllowed; // ✅ NEW

    await listing.save();
    await listing.populate('creator', 'name email');
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this listing.' });
    }
    await listing.deleteOne();
    res.json({ message: 'Listing deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/listings/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    const userId = req.user._id;
    const alreadyLiked = listing.likes.includes(userId);
    if (alreadyLiked) {
      listing.likes = listing.likes.filter(id => id.toString() !== userId.toString());
    } else {
      listing.likes.push(userId);
    }
    await listing.save();
    res.json({ likes: listing.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
