const express = require('express');
const Booking = require('../models/Booking');
const Stay = require('../models/Stay');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/bookings — traveler creates booking request
router.post('/', protect, async (req, res) => {
  try {
    const { stayId, checkIn, checkOut, message } = req.body;

    if (!stayId || !checkIn || !checkOut) {
      return res.status(400).json({ message: 'Stay, check-in and check-out dates are required.' });
    }

    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in.' });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past.' });
    }

    const stay = await Stay.findById(stayId);
    if (!stay) return res.status(404).json({ message: 'Stay not found.' });

    // Check for date conflicts
    const conflict = stay.bookedDates.some(b =>
      checkInDate < new Date(b.checkOut) && checkOutDate > new Date(b.checkIn)
    );
    if (conflict) {
      return res.status(400).json({ message: 'These dates are not available. Please choose different dates.' });
    }

    // Calculate nights and total price
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * stay.pricePerNight;

    const booking = await Booking.create({
      stay: stayId,
      traveler: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice,
      nights,
      message: message || '',
      status: 'pending'
    });

    await booking.populate('stay', 'name location imageUrl pricePerNight');
    await booking.populate('traveler', 'name photo email');

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings/my — traveler sees their own bookings
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ traveler: req.user._id })
      .populate('stay', 'name location imageUrl pricePerNight owner')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/bookings/manage — hotel owner sees bookings for their stays
router.get('/manage', protect, async (req, res) => {
  try {
    if (req.user.role !== 'hotel_owner') {
      return res.status(403).json({ message: 'Only hotel owners can manage bookings.' });
    }

    // Find all stays owned by this user
    const stays = await Stay.find({ owner: req.user._id }).select('_id');
    const stayIds = stays.map(s => s._id);

    const bookings = await Booking.find({ stay: { $in: stayIds } })
      .populate('stay', 'name location imageUrl')
      .populate('traveler', 'name photo email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/bookings/:id/confirm — hotel owner confirms booking
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('stay');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (booking.stay.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be confirmed.' });
    }

    booking.status = 'confirmed';
    await booking.save();

    // Add dates to stay booked dates to prevent future conflicts
    booking.stay.bookedDates.push({ checkIn: booking.checkIn, checkOut: booking.checkOut });
    await booking.stay.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/bookings/:id/cancel — traveler or owner cancels booking
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('stay');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    const isTraveler = booking.traveler.toString() === req.user._id.toString();
    const isOwner    = booking.stay.owner.toString() === req.user._id.toString();

    if (!isTraveler && !isOwner) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (['cancelled', 'refunded'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    // If confirmed and traveler cancels — set refund requested
    if (booking.status === 'confirmed' && isTraveler) {
      booking.status = 'refund_requested';
    } else {
      booking.status = 'cancelled';
    }

    booking.cancelReason = req.body.reason || '';

    // Remove from booked dates
    booking.stay.bookedDates = booking.stay.bookedDates.filter(d =>
      !(new Date(d.checkIn).getTime() === new Date(booking.checkIn).getTime() &&
        new Date(d.checkOut).getTime() === new Date(booking.checkOut).getTime())
    );
    await booking.stay.save();
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/bookings/:id/refund — hotel owner marks refund as done
router.put('/:id/refund', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('stay');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    if (booking.stay.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (booking.status !== 'refund_requested') {
      return res.status(400).json({ message: 'No refund request found for this booking.' });
    }

    booking.status = 'refunded';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
