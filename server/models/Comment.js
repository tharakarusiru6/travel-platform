const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Reply text is required'],
    trim: true,
    maxlength: [500, 'Reply cannot exceed 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  // owner replies go here
  replies: [replySchema]
}, { timestamps: true });

commentSchema.index({ listing: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
