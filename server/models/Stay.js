const mongoose = require('mongoose');

const staySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'Parking', 'Pool', 'AC', 'Breakfast', 'Gym', 'Restaurant', 'Laundry', 'Pet Friendly', 'Beach Access']
  }],
  // Dates that are already booked — to prevent double booking
  bookedDates: [{
    checkIn:  { type: Date, required: true },
    checkOut: { type: Date, required: true }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

staySchema.index({ name: 'text', location: 'text', description: 'text' });
staySchema.index({ createdAt: -1 });
staySchema.index({ pricePerNight: 1 });

module.exports = mongoose.model('Stay', staySchema);
