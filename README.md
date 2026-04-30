# TravelNest - Travel Experience Platform

TravelNest is a full-stack MERN travel marketplace with two parallel experiences: traveler-facing travel listings and hotel-owner-managed stays. Users can publish content, discover places to stay, rate and like entries, manage profiles, and handle bookings through role-based flows.

Live demo: https://drive.google.com/file/d/1ccYk5mygV-e5VHYtPWDLZkz1vxMkL-RY/view?usp=sharing
Repository: https://github.com/tharakarusiru6/travel-platform

## Key Features

- JWT authentication with register, login, and current-user support
- Role-based access for travelers and hotel owners
- Travel listings CRUD with search, likes, comments, threaded replies, and ratings
- Comments can be enabled or disabled per listing by the owner
- Public user profiles with private/public contact and social fields
- Stay management for hotel owners with CRUD, likes, filters, and ratings
- Booking lifecycle for travelers and owners, including confirm, cancel, and refund flow
- Paginated feeds for both listings and stays

## Tech Stack

- Frontend: React, Vite, React Router, Axios, react-hot-toast, date-fns
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication/Security: JWT, bcryptjs, CORS

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
- MongoDB Atlas account or local MongoDB instance

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

- User registers or logs in and receives a JWT token.
- Token is stored in `localStorage`.
- Axios adds `Authorization: Bearer <token>` on authenticated requests.
- Protected backend routes validate the token with auth middleware.
- On `401` responses, the client clears auth state and redirects to login.

## Data Models

- User: account info, password hash, role, photo, bio/about, privacy fields, and social links
- Listing: travel listing details, creator reference, likes, comments toggle, and rating data
- Comment: listing reference, author reference, text, and nested replies
- Rating: listing reference, user reference, and stars with a one-rating-per-user rule
- Stay: hotel stay details, owner reference, likes, booked dates, amenities, and ratings
- Booking: stay reference, traveler reference, dates, totals, status, and cancellation/refund details

## Indexing Strategy

- Listing text index on `title`, `location`, and `description` for search
- Listing index on `createdAt` for feed sorting
- Comment index on `listing + createdAt` for faster comment loads
- Unique rating index on `listing + user` to enforce one rating per user per entry
- Stay text and booking-date handling to support search, filters, and availability checks

## API Endpoints

### Auth

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Listings

- `GET /api/listings` - List listings with search and pagination
- `GET /api/listings/:id` - Get listing details
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update own listing
- `DELETE /api/listings/:id` - Delete own listing
- `POST /api/listings/:id/like` - Toggle like

### Listing Comments

- `GET /api/listings/:listingId/comments` - Get listing comments
- `POST /api/listings/:listingId/comments` - Add comment
- `DELETE /api/listings/:listingId/comments/:commentId` - Delete comment
- `POST /api/listings/:listingId/comments/:commentId/reply` - Reply to comment

### Listing Ratings

- `GET /api/listings/:listingId/ratings` - Get rating summary and current user rating
- `POST /api/listings/:listingId/ratings` - Submit or update rating

### Profile

- `GET /api/profile/:userId` - Get public profile
- `PUT /api/profile` - Update own profile

### Stays

- `GET /api/stays` - List stays with search, filters, and pagination
- `GET /api/stays/:id` - Get stay details
- `POST /api/stays` - Create stay for hotel owners
- `PUT /api/stays/:id` - Update own stay
- `DELETE /api/stays/:id` - Delete own stay
- `POST /api/stays/:id/like` - Toggle like

### Stay Ratings

- `GET /api/stays/:stayId/ratings` - Get stay rating summary and current user rating
- `POST /api/stays/:stayId/ratings` - Submit or update stay rating

### Bookings

- `POST /api/bookings` - Create booking request
- `GET /api/bookings/my` - View own bookings
- `GET /api/bookings/manage` - View bookings for owned stays
- `PUT /api/bookings/:id/confirm` - Confirm booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `PUT /api/bookings/:id/refund` - Mark refund as completed

## Scripts

Backend (`server/package.json`):

- `npm run dev` - Start server with nodemon
- `npm start` - Start server with node

Frontend (`client/package.json`):

- `npm run dev` - Start Vite dev server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build

## Future Improvements

- Image upload support through Cloudinary or S3
- Rate limiting for write endpoints
- Notifications for likes, comments, replies, and booking updates
- Automated tests for API and UI flows
