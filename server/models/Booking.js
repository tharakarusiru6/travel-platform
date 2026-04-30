const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  stay: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stay',
    required: true
  },
  traveler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  nights: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refund_requested', 'refunded'],
    default: 'pending'
  },
  message: {
    type: String,
    default: '',
    maxlength: [300, 'Message cannot exceed 300 characters']
  },
  cancelReason: {
    type: String,
    default: ''
  }
}, { timestamps: true });

bookingSchema.index({ traveler: 1, createdAt: -1 });
bookingSchema.index({ stay: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
