# 🚀 Deployment Guide: Smart Parking System

This guide provides step-by-step instructions for deploying the **Smart Parking System** to production using **Vercel**, **Render**, and **MongoDB Atlas** (Free Tier), as well as alternative deployment platforms like **Railway** and **Docker**.

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a new cluster (Select the **M0 Shared Free Tier**).
3. Under **Database Access**, create a database user (e.g., `parking_admin`) and set a strong password.
4. Under **Network Access**, add IP Address `0.0.0.0/0` to allow access from cloud services (Vercel/Render).
5. Click **Database** -> **Connect** -> **Drivers** (Node.js) and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/smartparking?retryWrites=true&w=majority
   ```
   *(Replace `<username>` and `<password>` with your actual MongoDB database credentials).*

---

## ⚙️ Step 2: Deploy Backend to Render (Node.js API)

1. Push your repository to **GitHub** or **GitLab**.
2. Log in to [Render.com](https://render.com/).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the service settings:
   - **Name**: `smart-parking-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node server.js`)
6. Add **Environment Variables** under the Environment tab:
   - `MONGO_URI`: *(Your MongoDB Atlas connection string from Step 1)*
   - `JWT_SECRET`: *(A secret key for JWT tokens, e.g. `smartparking_super_secret_jwt_2026`)*
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: *(Your deployed Vercel frontend URL, e.g. `https://smart-parking.vercel.app`)*
7. Click **Create Web Service**. Once deployed, Render will provide a URL like:
   `https://smart-parking-backend.onrender.com`

---

## 💻 Step 3: Deploy Frontend to Vercel (React App)

1. Log in to [Vercel.com](https://vercel.com/) with GitHub.
2. Click **Add New...** -> **Project**.
3. Select your repository.
4. Configure Project Settings:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: Select `frontend` (Click Edit and pick `frontend`).
5. Expand **Environment Variables** and add:
   - `REACT_APP_API_URL`: `https://smart-parking-backend.onrender.com/api` *(replace with your Render backend URL)*
   - `REACT_APP_GOOGLE_MAPS_KEY`: *(Your Google Maps API key)*
6. Click **Deploy**.
7. Vercel will build and launch your application! Copy your live domain (e.g. `https://smart-parking.vercel.app`).
8. Go back to Render and update the `CLIENT_URL` environment variable with your Vercel domain to secure CORS.

---

## 📦 Step 4: Alternative Single-Host Deployment (Render Web Service)

If you prefer to host both Frontend and Backend together on 1 Render Web Service:
1. Build command: `npm run install-all && npm run build`
2. Start command: `npm start`
3. Environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`.
4. The Express backend will serve the compiled React app directly!

---

## 🐳 Step 5: Containerized Deployment using Docker (Optional)

If deploying to AWS EC2, DigitalOcean Droplet, or Railway with Docker:

```bash
# Build and run containers
docker-compose up -d --build
```
- App running at: `http://localhost:5000`
- MongoDB running at: `localhost:27017`

---

## 🩺 Verification & Health Checks

After deployment, test the backend health route:
```bash
curl https://smart-parking-backend.onrender.com/api/health
```
Expected Response:
```json
{ "status": "ok", "message": "Smart Parking System API is running" }
```
