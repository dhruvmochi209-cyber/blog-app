# CodeNexus - Engineering Blog Platform

Welcome to **CodeNexus**, a modern, full-stack engineering blog platform designed for developers to read, draft, and publish high-quality technical articles. Built with performance, security, and aesthetics in mind.

![CodeNexus Overview](https://via.placeholder.com/1200x600.png?text=CodeNexus+Blog+Platform)

## 🚀 Features

- **Authentication & Security**
  - Custom JWT-based Authentication (Access & Refresh tokens).
  - Secure Google OAuth 2.0 Social Login.
  - Password Hashing (Bcrypt) and strict Rate Limiting against brute-force attacks.
- **Modern Frontend (Next.js)**
  - Fully responsive, glassmorphism-inspired UI with Tailwind CSS.
  - Smooth micro-animations using Framer Motion.
  - Mobile-first approach with a dynamic navigation system.
- **Robust Backend (Node.js / Express)**
  - RESTful API architecture.
  - MongoDB with Mongoose ODM for scalable data storage.
  - Centralized Error Handling.
- **Content Creation**
  - Rich text and markdown support for drafting articles.
  - Save as draft or publish immediately.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Security:** Helmet, Express-Rate-Limit, CORS, Bcryptjs
- **Auth:** Passport.js (Google Strategy), JSON Web Tokens (JWT)

---

## 📦 Getting Started (Local Development)

Follow these steps to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URL)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/dhruvmochi209-cyber/blog-app.git
cd blog-app
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/codenexus

# JWT Secrets
ACCESS_TOKEN_SECRET=your_super_secret_access_token
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Client URL
CLIENT_URL=http://localhost:3000

# Cookie Settings
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
```

Start the backend development server:
```bash
npm run dev
```

### 3. Setup Frontend
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Start the frontend development server:
```bash
npm run dev
```

The app will now be running on `http://localhost:3000`.

---

## ☁️ Deployment

### Backend (Render)
1. Push your code to GitHub.
2. Connect your repo to [Render](https://render.com) as a "Web Service".
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Copy all variables from your `.env` into the Render Environment Variables tab. 
   - Set `COOKIE_SECURE=true` and `COOKIE_SAME_SITE=none` for production cross-domain cookies.

### Frontend (Vercel)
1. Import your GitHub repo into [Vercel](https://vercel.com).
2. Set the Framework Preset to `Next.js`.
3. Set the Root Directory to `frontend`.
4. Add Environment Variable: `NEXT_PUBLIC_API_URL=https://your-render-backend-url.com/api`
5. Deploy.

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).
