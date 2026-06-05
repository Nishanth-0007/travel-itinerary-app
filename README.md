# ✈️ Travel Itinerary App

A full-stack AI-powered travel itinerary generator. Plan your trips smarter — upload documents, get AI-crafted day-by-day plans, and manage all your travel in one place.

---

## 🗂️ Project Structure

```
travel-itinerary-app/
├── backend/      # Node.js + Express REST API
└── frontend/     # React + Vite SPA
```

---

## 🚀 Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Axios   |
| Backend   | Node.js, Express, Mongoose (MongoDB)  |
| AI        | Google Gemini API                     |
| Storage   | AWS S3 (optional) / local `uploads/`  |
| Auth      | JWT (bcryptjs)                        |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- *(Optional)* AWS S3 bucket for file storage

---

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/travel-itinerary-app.git
cd travel-itinerary-app
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable             | Description                                    |
|----------------------|------------------------------------------------|
| `PORT`               | Server port (default `5000`)                   |
| `MONGO_URI`          | MongoDB connection string                      |
| `JWT_SECRET`         | Long random secret for signing tokens          |
| `JWT_EXPIRES_IN`     | Token expiry e.g. `7d`                         |
| `GEMINI_API_KEY`     | Your Google Gemini API key                     |
| `AWS_ACCESS_KEY_ID`  | *(Optional)* AWS credentials for S3 uploads    |
| `AWS_SECRET_ACCESS_KEY` | *(Optional)*                                |
| `AWS_REGION`         | *(Optional)* e.g. `us-east-1`                 |
| `AWS_S3_BUCKET`      | *(Optional)* S3 bucket name                   |
| `CLIENT_URL`         | Frontend URL for CORS (e.g. `http://localhost:5173`) |

Start the dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

> ⚠️ **Never commit your `.env` file.** It is listed in `.gitignore`.  
> Use `.env.example` as a template — it is safe to commit.

---

## 📦 Available Scripts

### Backend (`/backend`)

| Script      | Description                        |
|-------------|------------------------------------|
| `npm start` | Start production server            |
| `npm run dev` | Start with nodemon (auto-reload) |

### Frontend (`/frontend`)

| Script          | Description                   |
|-----------------|-------------------------------|
| `npm run dev`   | Start Vite dev server         |
| `npm run build` | Build for production          |
| `npm run preview` | Preview production build    |

---

## 📄 License

MIT
