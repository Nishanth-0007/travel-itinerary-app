# Travel Itinerary App

A full-stack web application that parses uploaded travel documents (PDF or image) using the Google Gemini API and generates structured, day-by-day itineraries. Users can create, view, edit, and delete their itineraries from a personal dashboard.

---

## Project Structure

```
travel-itinerary-app/
├── backend/                  # Node.js + Express REST API
│   ├── config/
│   │   ├── db.js             # MongoDB connection
│   │   └── s3.js             # AWS S3 client + storage mode detection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── itineraryController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── uploadMiddleware.js # Multer (local or S3)
│   ├── models/
│   │   ├── User.js
│   │   └── Itinerary.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── itineraryRoutes.js
│   │   └── uploadRoutes.js
│   ├── utils/
│   │   └── aiParser.js        # PDF/image extraction + Gemini parsing pipeline
│   ├── uploads/               # Local file storage (ignored by git)
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── components/
    │   │   ├── DropZone.jsx
    │   │   ├── ItineraryCard.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── NewItineraryModal.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # JWT auth state + axios header management
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── CreateItinerary.jsx
    │   │   └── ViewItinerary.jsx
    │   ├── App.jsx              # Routes definition
    │   ├── main.jsx             # App entry — sets axios.defaults.baseURL
    │   └── index.css
    ├── .env.example
    ├── package.json
    └── vite.config.js           # Dev proxy: /api and /uploads -> localhost:5000
```

---

## Tech Stack

### Backend

| Package                    | Purpose                                       |
|----------------------------|-----------------------------------------------|
| express                    | HTTP server and routing                       |
| mongoose                   | MongoDB ODM                                   |
| @google/generative-ai      | Gemini 1.5 Flash — document parsing and AI    |
| pdf-parse                  | Extract text from uploaded PDF files          |
| multer                     | File upload handling                          |
| multer-s3                  | Multer storage adapter for AWS S3             |
| @aws-sdk/client-s3         | AWS S3 client (optional — falls back to disk) |
| @aws-sdk/s3-request-presigner | Generate presigned S3 URLs                 |
| jsonwebtoken               | Issue and verify JWT tokens                   |
| bcryptjs                   | Password hashing (salt rounds: 12)            |
| cors                       | Cross-origin request handling                 |
| dotenv                     | Load environment variables from .env          |
| express-async-errors       | Catch async errors without try/catch wrappers |
| uuid                       | Generate unique filenames for uploads         |
| nodemon (dev)              | Auto-restart server on file changes           |

### Frontend

| Package              | Purpose                                      |
|----------------------|----------------------------------------------|
| react 18             | UI framework                                 |
| react-router-dom v6  | Client-side routing                          |
| axios                | HTTP client — baseURL set from VITE_API_URL  |
| tailwindcss          | Utility-first CSS                            |
| lucide-react         | Icon library                                 |
| vite                 | Dev server and build tool                    |

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path        | Auth required | Description          |
|--------|-------------|---------------|----------------------|
| POST   | /register   | No            | Register a new user  |
| POST   | /login      | No            | Log in, get JWT      |
| GET    | /me         | Yes           | Get current user     |

### Itineraries — `/api/itinerary`

All routes require a valid JWT.

| Method | Path           | Description                             |
|--------|----------------|-----------------------------------------|
| GET    | /              | List all itineraries (paginated)        |
| POST   | /              | Create a new itinerary manually         |
| GET    | /:id           | Get a single itinerary                  |
| PUT    | /:id           | Update an itinerary                     |
| DELETE | /:id           | Soft-delete an itinerary                |
| GET    | /:id/status    | Poll AI processing status               |

### Upload — `/api/upload`

| Method | Path | Auth required | Description                                           |
|--------|------|---------------|-------------------------------------------------------|
| POST   | /    | Yes           | Upload a PDF or image; triggers AI parsing in background |

Accepted file types: PDF, JPEG, PNG, WebP. Max size: 10 MB.

### Other

| Method | Path         | Description            |
|--------|--------------|------------------------|
| GET    | /api/health  | Health check endpoint  |

---

## Deployment

This app is deployed across two platforms:

| Service      | Platform | Notes                                     |
|--------------|----------|-------------------------------------------|
| Frontend     | Vercel   | Set Root Directory to `frontend`          |
| Backend      | Render   | Always-on Node.js web service (free tier) |
| Database     | MongoDB Atlas | Free M0 cluster — local MongoDB (Compass) does not work in cloud deployment |

### Deploy backend on Render

1. Create a new Web Service, connect your GitHub repository
2. Set Root Directory to `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables (see table below)
6. Note your service URL: `https://<your-service>.onrender.com`

> Render assigns PORT dynamically. The server reads `process.env.PORT || 5000`, so no change is needed.

### Deploy frontend on Vercel

1. Import your GitHub repository on Vercel
2. Set Root Directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://<your-service>.onrender.com`
4. Deploy

> The Vite dev proxy (`/api` -> `localhost:5000`) only runs locally. In production, `axios.defaults.baseURL` set in `main.jsx` takes over.

---

## Local Development

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- Google Gemini API key — [get one here](https://aistudio.google.com/app/apikey)
- Optional: AWS S3 bucket for file storage

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/travel-itinerary-app.git
cd travel-itinerary-app
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# Vite proxies /api/* and /uploads/* to localhost:5000 automatically
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                | Required | Description                                                        |
|-------------------------|----------|--------------------------------------------------------------------|
| PORT                    | No       | Server port. Defaults to 5000 locally. Render sets this automatically. |
| NODE_ENV                | No       | `development` or `production`                                      |
| MONGO_URI               | Yes      | MongoDB Atlas connection string                                    |
| JWT_SECRET              | Yes      | Random string, minimum 64 characters                               |
| JWT_EXPIRES_IN          | No       | Token lifetime e.g. `7d`. Defaults to `7d`.                        |
| GEMINI_API_KEY          | Yes      | Google Gemini API key                                              |
| CLIENT_URL              | Yes      | Frontend URL for CORS — `http://localhost:5173` locally, your Vercel URL in production |
| AWS_ACCESS_KEY_ID       | No       | If omitted, storage falls back to local disk (`uploads/`)          |
| AWS_SECRET_ACCESS_KEY   | No       | Required if using S3                                               |
| AWS_REGION              | No       | e.g. `us-east-1`. Required if using S3.                            |
| AWS_S3_BUCKET           | No       | S3 bucket name. Required if using S3.                              |

Storage mode is detected automatically: if `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are both set, the app uses S3; otherwise it writes files to `backend/uploads/`.

### Frontend (`frontend/.env`)

| Variable       | Required | Description                                                              |
|----------------|----------|--------------------------------------------------------------------------|
| VITE_API_URL   | No       | Backend base URL. Defaults to `http://localhost:5000` if not set. Set to your Render URL in Vercel. |

> Never commit `.env` files. Both are listed in `.gitignore`. Use the `.env.example` files as templates.

---

## Available Scripts

### Backend

| Script        | Description                      |
|---------------|----------------------------------|
| npm start     | Start with Node                  |
| npm run dev   | Start with nodemon (auto-reload) |

### Frontend

| Script          | Description                    |
|-----------------|--------------------------------|
| npm run dev     | Start Vite dev server          |
| npm run build   | Build for production           |
| npm run preview | Preview production build       |

---

## License

MIT
