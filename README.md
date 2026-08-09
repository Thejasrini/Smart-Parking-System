# 🅿️ Smart Parking System – AI-Powered Parking Marketplace

[![Frontend Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://smart-parking-system-nu-two.vercel.app)
[![Backend Status](https://img.shields.io/badge/Render-Active-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://smartpark-intelligent-parking-marketplace.onrender.com/api/health)
[![Database](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

A full-stack MERN (MongoDB, Express, React, Node.js) web application designed to solve urban parking challenges. The platform connects vehicle owners looking for convenient parking spots with parking space owners, featuring interactive map navigation, role-based access control, AI-driven spot availability forecasting, and peak-hour analytics.

---

## 🔗 Live Demo & Links

- **🌐 Live Web Application**: [https://smart-parking-system-nu-two.vercel.app](https://smart-parking-system-nu-two.vercel.app)
- **🖥️ Backend API Endpoint**: `https://smartpark-intelligent-parking-marketplace.onrender.com/api`
- **📂 GitHub Repository**: [https://github.com/Thejasrini/Smart-Parking-System](https://github.com/Thejasrini/Smart-Parking-System)

---

## ✨ Key Features

### 🚗 **For Users (Drivers)**
- **Geolocation Search**: Find nearby parking spots sorted by nearest distance using Google Maps & Leaflet.
- **Slot Reservation**: Book parking slots by date and time slot.
- **AI Availability Prediction**: Check likelihood of slot availability (🟢 Likely Available / 🔴 Likely Full).
- **Peak Hour Analytics**: View traffic demand charts to pick the best time for parking.
- **Smart AI Chatbot**: Interactive assistant to answer parking queries and recommend cheap options.
- **Booking History**: Track active, approved, and past reservations.

### 🅿️ **For Parking Space Owners**
- **List Parking Facilities**: Add new parking locations with slot counts, hourly pricing, address, and coordinates.
- **Booking Management**: Approve or reject incoming user reservation requests.
- **Earnings & Dashboard**: Track facility utilization and active bookings.

### 🛡️ **For Admins**
- **Platform Verification**: Review and approve newly listed parking spaces before public visibility.
- **User & Owner Moderation**: Manage accounts and platform activity.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v7, Leaflet, Google Maps API, Axios, CSS3 |
| **Backend** | Node.js, Express.js, JWT (JSON Web Tokens), Bcryptjs |
| **Database** | MongoDB Atlas, Mongoose ORM |
| **DevOps & Cloud** | Vercel (Frontend CDN), Render (Backend Web Service), Docker |

---

## 📁 Repository Structure

```text
Parking_System/
├── backend/
│   ├── controllers/      # Route controllers (Auth, Parking, Booking, AI, Review)
│   ├── middleware/       # Auth JWT middleware & role permissions
│   ├── models/           # Mongoose schemas (User, Parking, Booking, Review)
│   ├── routes/           # Express API endpoints
│   ├── server.js         # Entry point for backend server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/          # Axios instance & dynamic API URL setup
│   │   ├── components/   # Shared UI components & navigation
│   │   ├── pages/        # User, Owner, and Admin views
│   │   └── App.js        # React Router configuration
│   ├── vercel.json       # Vercel SPA routing rewrite config
│   └── package.json
├── Dockerfile            # Multi-stage production container build
├── docker-compose.yml    # Full-stack local Docker deployment
├── render.yaml           # Render blueprint configuration
└── DEPLOYMENT.md         # Deployment step-by-step documentation
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (Local or MongoDB Atlas cluster URI)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Thejasrini/Smart-Parking-System.git
   cd Smart-Parking-System
   ```

2. **Configure Backend Environment Variables**
   Create a `.env` file inside the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/smartparking
   JWT_SECRET=your_secret_jwt_key
   CLIENT_URL=http://localhost:3000
   ```

3. **Configure Frontend Environment Variables**
   Create a `.env` file inside the `frontend/` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_api_key
   ```

4. **Install Dependencies & Start Development Servers**

   - **Backend**:
     ```bash
     cd backend
     npm install
     npm run dev
     ```

   - **Frontend**:
     ```bash
     cd frontend
     npm install
     npm start
     ```

   - Open `http://localhost:3000` in your browser.

---

## 📡 API Endpoints Quick Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register user (`user`, `owner`, `admin`) | ❌ No |
| `POST` | `/api/auth/login` | User login & return JWT token | ❌ No |
| `GET` | `/api/parking/search` | Nearby parking search by lat/lng | 🔑 Yes |
| `POST` | `/api/parking/add` | Add new parking facility (Owner) | 🔑 Owner |
| `POST` | `/api/booking/create` | Create parking slot reservation | 🔑 User |
| `GET` | `/api/ai/predict/:id` | AI availability prediction | 🔑 Yes |
| `GET` | `/api/health` | Backend server health check | ❌ No |

---

## 🚀 Deployment

For step-by-step deployment instructions to **Vercel**, **Render**, and **MongoDB Atlas**, refer to [DEPLOYMENT.md](DEPLOYMENT.md).


