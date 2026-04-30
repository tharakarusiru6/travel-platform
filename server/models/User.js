const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // ✅ NEW — role field
  role: {
    type: String,
    enum: ['traveler', 'hotel_owner'],
    default: 'traveler'
  },

  // Profile fields
  photo:        { type: String, default: '' },
  about:        { type: String, default: '', maxlength: [200, 'About cannot exceed 200 characters'] },
  phone:        { type: String, default: '' },
  phonePublic:  { type: Boolean, default: false },
  socialMedia: {
    instagram: { type: String, default: '' },
    facebook:  { type: String, default: '' },
    twitter:   { type: String, default: '' }
  },
  socialPublic: { type: Boolean, default: false }

}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
