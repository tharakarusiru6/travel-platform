# ✦ TravelNest — Travel Experience Platform

A full-stack web application where experience providers can publish travel listings and travelers can discover unique local experiences.
fff
**Live Demo-** https://drive.google.com/file/d/1ccYk5mygV-e5VHYtPWDLZkz1vxMkL-RY/view?usp=sharing
**GitHub-** https://github.com/tharakarusiru6/travel-platform

---

# Project Overview

TravelNest is a marketplace-style platform where users can register, log in, and post travel experience listings (tours, activities, local adventures). All listings appear in a public feed accessible to anyone. Logged-in users can also like, edit, and delete their own listings, and search through all experiences.

---

# Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | React + Vite | Fast builds, modern hooks-based architecture |
| Routing | React Router v6 | Clean client-side navigation |
| HTTP Client | Axios | Interceptors for auto token attachment |
| Backend | Node.js + Express | Lightweight REST API |
| Database | MongoDB + Mongoose | Flexible document schema for listings |
| Authentication | JWT (JSON Web Tokens) | Stateless, scalable auth |
| Styling | CSS Modules + Google Fonts | Custom design without heavy dependencies |
| Notifications | react-hot-toast | Clean user feedback |
| Deployment | Vercel (frontend) + Render (backend) | Free tier, easy CI/CD |

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB Atlas account (free) OR local MongoDB

# 1. Set Up the Backend
```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your values:
```env
MONGO_URI=mongodb+srv://tharakarusiru6_db_user:W4vMA9paXkeviZFC@travel.02uix75.mongodb.net/?appName=Travel
JWT_SECRET=any_long_random_string_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```
Server runs at `http://localhost:5000`

# 2. Set Up the Frontend
```bash
cd ../client
npm install
cp .env.example .env
```

The `.env` file should contain:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the React app:
```bash
npm run dev
```
App runs at `http://localhost:5173`

---

## Features Implemented

# Core Features
- **User Registration & Login** — JWT-based authentication with bcrypt password hashing
- **Create Travel Listing** — Title, location, image URL, description, optional price
- **Public Feed** — All listings visible to anyone, newest first
- **Listing Detail Page** — Full details including creator info

# Optional Features
- **Edit Listing** — Owners can update their listings
- **Delete Listing** — Owners can delete with confirmation dialog
- **Search Listings** — Full-text search powered by MongoDB text indexes
- **Like / Save Listing** — Toggle likes on any listing
- **Responsive Mobile UI** — Works on all screen sizes
- **Pagination** — 12 listings per page

---

## Architecture & Key Decisions

# Why this tech stack?
React + Express + MongoDB was chosen as the MERN stack is widely documented and easy to deploy. Vite provides faster development builds compared to CRA. MongoDB's flexible schema is ideal for listings where fields like price are optional.

# How authentication works
Users register/login via POST requests to `/api/auth`. The server validates credentials, hashes passwords with bcrypt (salt rounds: 12), and returns a **JWT token** valid for 7 days. The token is stored in `localStorage` on the client and automatically attached to all subsequent API requests via an Axios request interceptor. Protected routes on both client (React Router) and server (Express middleware) verify this token before allowing access.

# How listings are stored
Each listing document in MongoDB contains: title, location, imageUrl, description, price (nullable), a `creator` reference (ObjectId) to the User collection, and a `likes` array of User ObjectIds. Listings are populated with creator name/email on fetch. MongoDB text indexes on title, location, and description enable full-text search without additional infrastructure.

# One improvement with more time
I would implement **image upload** via Cloudinary or AWS S3 instead of requiring image URLs. This would significantly improve UX — most users don't have hosted image URLs readily available. I would also add user profile pages showing all listings by a specific creator.

---

# Product Thinking- Scaling to 10,000 Listings

If this platform grew to 10,000 travel listings, several changes would be needed. First, **pagination** is already implemented, but I would switch to cursor-based (keyset) pagination instead of offset pagination for better performance at scale. Second, I would add **compound database indexes** on `createdAt`, `location`, and a geospatial index to support location-based filtering — this would prevent full collection scans. Third, for search, I would migrate from MongoDB's basic text search to **Elasticsearch or Algolia** which handle typos, fuzzy matching, and relevance ranking far better. Fourth, I would introduce **Redis caching** for the public feed endpoint (TTL of 30–60 seconds) since most visitors only read and don't write, dramatically reducing database load. Fifth, the listing images should be served through a **CDN** like Cloudflare with responsive image variants so mobile users aren't downloading full-resolution images. Finally, the API would benefit from **rate limiting** on write endpoints and **query result limiting** with cursor tokens to prevent expensive queries from degrading the experience for other users.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/listings` | No | Get all listings (search, page) |
| GET | `/api/listings/:id` | No | Get single listing |
| POST | `/api/listings` | Yes | Create listing |
| PUT | `/api/listings/:id` | Yes | Update listing (owner only) |
| DELETE | `/api/listings/:id` | Yes | Delete listing (owner only) |
| POST | `/api/listings/:id/like` | Yes | Toggle like |
