# Multi-Portal Order Management System

## Setup Instructions

### 1. Backend (FastAPI)

1. Open your terminal in the `backend` directory.
2. Ensure you have a PostgreSQL instance running and available.
3. Update the `DATABASE_URL` in `backend/.env` (you can copy it from `.env.example`).
4. Activate the virtual environment (if not already active) and install dependencies.
5. Run the seed script to populate the database with test users and products:
   ```bash
   python seed.py
   ```
6. Start the API server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 2. Frontend (Next.js)

1. Open a new terminal in the `frontend` directory.
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### 3. Test Users

You can test the system by logging in at `http://localhost:3000/login` with the following seeded accounts:
- **Admin**: `admin@oms.com` / `admin123`
- **Staff**: `staff@oms.com` / `staff123`
- **Client**: `client@oms.com` / `client123`
