# Anarchy Bay

Anarchy Bay is a modern, full-stack digital product marketplace and e-commerce platform. It enables users to browse, purchase, and download digital products securely, while also providing tools for sellers to manage their inventory and an admin dashboard for platform oversight.

## 🚀 Features

- **User Authentication**: Secure signup and login powered by Supabase.
- **Product Marketplace**: Browse, search, and view detailed product pages with rich 3D visuals.
- **Digital Downloads**: Securely purchase and download digital goods.
- **Cart & Wishlist**: Manage items you intend to buy or save for later.
- **Payment Integration**: Seamless checkout process using Razorpay.
- **Seller Dashboard**: Create, edit, and manage products, track analytics, and handle payouts.
- **Admin Panel**: Comprehensive oversight over platform activities.
- **Promotions**: Support for discount codes and sales.
- **Responsive & Dynamic UI**: Built with modern animations (Framer Motion, GSAP) and 3D elements (Three.js).

## 🛠 Tech Stack

**Frontend:**
- React 19
- Vite
- TailwindCSS 4
- React Router DOM
- Framer Motion & GSAP (Animations)
- Three.js & React Three Fiber (3D graphics)
- Radix UI (Headless components)
- Supabase Auth UI
- React Razorpay

**Backend:**
- Node.js & Express.js
- Supabase JS Client (Database & Auth)
- Redis (Caching & Sessions via ioredis)
- Razorpay API
- Pino (Logging)
- Zod (Validation)
- Helmet & CORS (Security)

**Infrastructure:**
- Docker & Docker Compose
- Supabase Local CLI
- Jenkins for CI/CD

## 🏗 Project Structure

- `/frontend` - Contains the React application.
- `/backend` - Contains the Express server and API routes.
- `/database` - Contains Supabase migrations and configuration.
- `docker-compose.yml` - For local development orchestration.
- `Jenkinsfile` - CI/CD pipeline configuration.

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- Supabase CLI

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AnarchyBay1
   ```

2. **Database Setup:**
   Ensure you have Docker running, then start the local Supabase instance:
   ```bash
   cd database
   supabase start
   supabase migration up
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file based on environment requirements (Supabase URLs, Razorpay keys, etc.)
   npm run dev
   ```

4. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   # Create a .env file with VITE_ prefixed environment variables
   npm run dev
   ```

### Running with Docker Compose
You can spin up the entire stack using Docker Compose:
```bash
docker-compose up --build
```
This will start the frontend, backend, and Redis container.

## 🛡 Security & Best Practices
- Helmet.js is used for setting secure HTTP headers.
- Input sanitization and validation are handled via Zod.
- Rate limiting is applied to all API endpoints.
- Secure HTTP cookies and JWTs manage user sessions.

## 📄 License
ISC License