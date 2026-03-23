const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const commentRoutes = require('./routes/comments');
const ratingRoutes  = require('./routes/ratings');
const profileRoutes = require('./routes/profile'); // ✅ NEW

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/listings/:listingId/comments', commentRoutes);
app.use('/api/listings/:listingId/ratings',  ratingRoutes);
app.use('/api/profile',  profileRoutes); // ✅ NEW

app.get('/', (req, res) => res.json({ message: 'TravelNest API is running!' }));

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB connection error:', err.message); process.exit(1); });
