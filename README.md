# TravelNest - Travel Experience Platform

TravelNest is a full-stack MERN application where users can publish and explore travel listings, interact through likes/comments/ratings, and manage public profile details.

Live demo: https://drive.google.com/file/d/1ccYk5mygV-e5VHYtPWDLZkz1vxMkL-RY/view?usp=sharing
Repository: https://github.com/tharakarusiru6/travel-platform

## Key Features

- JWT authentication (register, login, current user)
- Protected frontend routes for authenticated actions
- Create, read, update, and delete travel listings
- Full-text listing search and paginated listing feed
- Like/unlike listings
- Comments with threaded replies
- 1-5 star rating system (per-user rating, aggregated average)
- Public user profiles with privacy-controlled contact/social fields
- Toggle comments on/off per listing (owner control)

## Tech Stack

- Frontend: React, Vite, React Router, Axios, react-hot-toast
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication/Security: JWT, bcryptjs

## Project Structure

```
travel-platform/
	client/   # React + Vite frontend
	server/   # Express + MongoDB backend API
```

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account (or local MongoDB)

### 1) Setup Backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

Backend base URL: `http://localhost:5000`

### 2) Setup Frontend

```bash
cd client
npm install
```

Create a `.env` file inside `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## Authentication Flow

- User logs in or registers and receives a JWT token.
- Token is stored in localStorage.
- Axios request interceptor automatically adds `Authorization: Bearer <token>`.
- Protected backend routes validate token using auth middleware.
- On 401 responses, client clears auth state and redirects to login.

## Database Models

- User: account info, password hash, photo, bio/about, privacy fields, social links
- Listing: travel listing details, creator reference, likes, comments toggle
- Comment: listing reference, author reference, text, nested replies
- Rating: listing reference, user reference, stars (unique index per user/listing)

## Indexing Strategy

- Listing text index on `title`, `location`, and `description` for search
- Listing index on `createdAt` for feed sorting
- Comment index on `listing + createdAt` for faster listing comment loads
- Unique rating index on `listing + user` to enforce one rating per user per listing

## API Endpoints (17)

### Auth

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Listings

- `GET /api/listings` - List listings (search + pagination)
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing (protected)
- `PUT /api/listings/:id` - Update own listing (protected)
- `DELETE /api/listings/:id` - Delete own listing (protected)
- `POST /api/listings/:id/like` - Toggle like (protected)

### Comments

- `GET /api/listings/:listingId/comments` - Get listing comments
- `POST /api/listings/:listingId/comments` - Add comment (protected)
- `DELETE /api/listings/:listingId/comments/:commentId` - Delete comment (author/owner)
- `POST /api/listings/:listingId/comments/:commentId/reply` - Reply to comment (protected)

### Ratings

- `GET /api/listings/:listingId/ratings` - Get rating summary and current user rating
- `POST /api/listings/:listingId/ratings` - Submit/update rating (protected)

### Profile

- `GET /api/profile/:userId` - Get public profile
- `PUT /api/profile` - Update own profile (protected)

## Scripts

Backend (`server/package.json`):

- `npm run dev` - Start server with nodemon
- `npm start` - Start server with node

Frontend (`client/package.json`):

- `npm run dev` - Start Vite dev server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build

## Future Improvements

- Image upload support (Cloudinary/S3)
- Rate limiting for write endpoints
- Role-based accounts (host/traveler)
- Notification system for likes/comments/replies
- Automated tests (unit + integration)
