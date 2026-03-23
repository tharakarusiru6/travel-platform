const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/profile/:userId — view any user's public profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -email');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Get their listings
    const listings = await Listing.find({ creator: req.params.userId })
      .sort({ createdAt: -1 });

    // Build response — hide private fields
    const profile = {
      _id: user._id,
      name: user.name,
      photo: user.photo,
      about: user.about,
      phone: user.phonePublic ? user.phone : null,
      phonePublic: user.phonePublic,
      socialMedia: user.socialPublic ? user.socialMedia : null,
      socialPublic: user.socialPublic,
      createdAt: user.createdAt,
      listings
    };

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/profile — update own profile (protected)
router.put('/', protect, async (req, res) => {
  try {
    const { name, photo, about, phone, phonePublic, socialMedia, socialPublic } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (name) user.name = name;
    if (photo !== undefined) user.photo = photo;
    if (about !== undefined) user.about = about;
    if (phone !== undefined) user.phone = phone;
    if (phonePublic !== undefined) user.phonePublic = phonePublic;
    if (socialMedia !== undefined) user.socialMedia = { ...user.socialMedia, ...socialMedia };
    if (socialPublic !== undefined) user.socialPublic = socialPublic;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      about: user.about,
      phone: user.phone,
      phonePublic: user.phonePublic,
      socialMedia: user.socialMedia,
      socialPublic: user.socialPublic
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
