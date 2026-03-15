const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, { timestamps: true });

// One rating per user per listing
ratingSchema.index({ listing: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
