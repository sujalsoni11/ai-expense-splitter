# AI Expense Splitter with OCR

A complete, production-ready Full Stack web application that allows multiple users to collaborate in real-time, create trip groups, track expenses, scan receipts using OCR, and calculate settlements like Splitwise.

## 🚀 Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + Lucide React
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io
- **OCR Engine**: Tesseract.js (Node server-side)
- **Authentication**: JWT & bcrypt

---

## 💻 Setup Instructions & How to Run Locally

### 1. Prerequisites
- Node.js installed (v16+)
- MongoDB running locally on port `27017` (or replace URI with MongoDB Atlas)

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory (already generated) with:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ai-expense-splitter
   JWT_SECRET=your_super_secret_jwt_key_here
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 📡 Sample API Requests

### 1. Register User (POST `/api/auth/register`)
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

### 2. Login User (POST `/api/auth/login`)
**Headers:** `Content-Type: application/json`
**Body:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```
**Response:** Returns a `token` to be used in Bearer Auth header for protected routes.

### 3. Create a Trip (POST `/api/trips`)
**Headers:** `Authorization: Bearer <TOKEN>`
**Body:**
```json
{
  "name": "Weekend Getaway",
  "budget": 20000
}
```

### 4. Upload Receipt for OCR (POST `/api/ocr/scan`)
**Headers:** `Authorization: Bearer <TOKEN>`
**Body (form-data):**
Key: `receipt` (File type) -> Select an image.
**Response:**
```json
{
  "amount": 1450.50,
  "receiptImage": "/uploads/receipt-16234...jpg"
}
```

### 5. Get Trip Settlements (GET `/api/expenses/trip/:id/settlements`)
**Headers:** `Authorization: Bearer <TOKEN>`
**Response:**
```json
{
  "settlements": [
    {
      "from": "user_id_1",
      "to": "user_id_2",
      "amount": 350
    }
  ],
  "stats": {
    "totalSpent": 1500,
    "userContribution": 750
  }
}
```

---

## 💡 Deployment (Render / Vercel)
- **Backend on Render:** Create a Web Service. Point to the `backend/` directory. Set Start Command to `node server.js`. Add the `.env` variables under Environment.
- **Frontend on Vercel:** Import the repository, set the Root Directory to `frontend`. Vite will automatically be detected. Ensure you configure an environment variable or proxy redirect inside Vercel for API calls to point to your live Render backend URL.
