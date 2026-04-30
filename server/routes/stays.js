const express = require('express');
const Stay = require('../models/Stay');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware — only hotel owners can create/edit stays
const hotelOwnerOnly = (req, res, next) => {
  if (req.user.role !== 'hotel_owner') {
    return res.status(403).json({ message: 'Only hotel owners can perform this action.' });
  }
  next();
};

// GET /api/stays — public feed with search and filters
router.get('/', async (req, res) => {
  try {
    const { search, location, minPrice, maxPrice, minRating, amenities, checkIn, checkOut, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Text search
    if (search) query.$text = { $search: search };

    // Location filter
    if (location) query.location = { $regex: location, $options: 'i' };

    // Price filter
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    // Amenities filter
    if (amenities) {
      const amenityList = amenities.split(',');
      query.amenities = { $all: amenityList };
    }

    // Date availability filter — exclude stays with conflicting bookings
    if (checkIn && checkOut) {
      const checkInDate  = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      query['bookedDates'] = {
        $not: {
          $elemMatch: {
            checkIn:  { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
          }
        }
      };
    }

    const [stays, total] = await Promise.all([
      Stay.find(query)
        .populate('owner', 'name photo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Stay.countDocuments(query)
    ]);

    res.json({ stays, totalPages: Math.ceil(total / limit), currentPage: Number(page), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/stays/:id
router.get('/:id', async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id).populate('owner', 'name photo email');
    if (!stay) return res.status(404).json({ message: 'Stay not found.' });
    res.json(stay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/stays — hotel owner only
router.post('/', protect, hotelOwnerOnly, async (req, res) => {
  try {
    const { name, location, imageUrl, description, pricePerNight, amenities } = req.body;

    if (!name || !location || !imageUrl || !description || !pricePerNight) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const stay = await Stay.create({
      name, location, imageUrl, description,
      pricePerNight: Number(pricePerNight),
      amenities: amenities || [],
      owner: req.user._id
    });

    await stay.populate('owner', 'name photo');
    res.status(201).json(stay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/stays/:id — hotel owner only
router.put('/:id', protect, hotelOwnerOnly, async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id);
    if (!stay) return res.status(404).json({ message: 'Stay not found.' });
    if (stay.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this stay.' });
    }

    const { name, location, imageUrl, description, pricePerNight, amenities } = req.body;
    if (name)          stay.name          = name;
    if (location)      stay.location      = location;
    if (imageUrl)      stay.imageUrl      = imageUrl;
    if (description)   stay.description   = description;
    if (pricePerNight) stay.pricePerNight = Number(pricePerNight);
    if (amenities)     stay.amenities     = amenities;

    await stay.save();
    await stay.populate('owner', 'name photo');
    res.json(stay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/stays/:id — hotel owner only
router.delete('/:id', protect, hotelOwnerOnly, async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id);
    if (!stay) return res.status(404).json({ message: 'Stay not found.' });
    if (stay.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this stay.' });
    }
    await stay.deleteOne();
    res.json({ message: 'Stay deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/stays/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id);
    if (!stay) return res.status(404).json({ message: 'Stay not found.' });
    const userId = req.user._id;
    const alreadyLiked = stay.likes.includes(userId);
    if (alreadyLiked) {
      stay.likes = stay.likes.filter(id => id.toString() !== userId.toString());
    } else {
      stay.likes.push(userId);
    }
    await stay.save();
    res.json({ likes: stay.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
